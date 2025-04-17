"""Create authentication and authorization tables

Revision ID: a7f3b8c2_9e7d_4d23_a1e8_7c2f3e9b4c6e
Revises: 
Create Date: 2025-04-17
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'a7f3b8c2_9e7d_4d23_a1e8_7c2f3e9b4c6e'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Enable required extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String, nullable=False, unique=True),
        sa.Column('password_hash', sa.String, nullable=False),  # Hashed with bcrypt
        sa.Column('first_name', sa.String, nullable=False),
        sa.Column('last_name', sa.String, nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, default=False),  # Pending admin approval
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, nullable=True, onupdate=datetime.utcnow),
        sa.Column('locked_until', sa.DateTime, nullable=True),  # For lockout after 5 failed attempts
    )

    # Create roles table
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, nullable=False, unique=True),  # e.g., Admin, Manager
        sa.Column('permissions', JSONB, nullable=True),  # Optional JSON for detailed permissions
    )

    # Create groups table
    op.create_table(
        'groups',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, nullable=False, unique=True),  # e.g., ProjectX, LabA
        sa.Column('description', sa.String, nullable=True),
        sa.Column('parent_group_id', sa.Integer, sa.ForeignKey('groups.id'), nullable=True),  # For group hierarchies
    )

    # Create user_roles table (many-to-many)
    op.create_table(
        'user_roles',
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('role_id', sa.Integer, sa.ForeignKey('roles.id'), primary_key=True),
    )

    # Create user_groups table (many-to-many)
    op.create_table(
        'user_groups',
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('group_id', sa.Integer, sa.ForeignKey('groups.id'), primary_key=True),
    )

    # Create audit_log table
    op.create_table(
        'audit_log',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=True),
        sa.Column('action', sa.String, nullable=False),  # e.g., signup, login, approve_user
        sa.Column('details', JSONB, nullable=True),  # e.g., {"ip": "127.0.0.1", "endpoint": "/auth/token"}
        sa.Column('timestamp', sa.DateTime, nullable=False, default=datetime.utcnow),
    )

    # Create refresh_tokens table
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token', UUID(as_uuid=True), nullable=False, unique=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('expires_at', sa.DateTime, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
    )

    # Create samples table (example data table with RLS)
    op.create_table(
        'samples',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('sample_id', sa.String, nullable=False, unique=True),
        sa.Column('group_id', sa.Integer, sa.ForeignKey('groups.id'), nullable=False),
        sa.Column('type', sa.String, nullable=False),
        sa.Column('status', sa.String, nullable=False),
        sa.Column('metadata', JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
    )

    # Enable RLS on samples table
    op.execute("ALTER TABLE samples ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE samples FORCE ROW LEVEL SECURITY;")

    # Create RLS policy for group-based access
    op.execute("""
        CREATE POLICY group_access ON samples
        USING (
            group_id = ANY(
                (SELECT array_agg(group_id) FROM user_groups
                 WHERE user_id = current_setting('app.user_id')::int)
            )
        );
    """)

    # Create policy for admin bypass (optional)
    op.execute("""
        CREATE POLICY admin_bypass ON samples
        USING (
            EXISTS (
                SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = current_setting('app.user_id')::int
                AND r.name = 'Admin'
            )
        )
        WITH CHECK (true);
    """)

    # Create indexes for performance
    op.create_index('idx_samples_group_id', 'samples', ['group_id'])
    op.create_index('idx_user_groups_user_id', 'user_groups', ['user_id'])
    op.create_index('idx_user_roles_user_id', 'user_roles', ['user_id'])
    op.create_index('idx_audit_log_timestamp', 'audit_log', ['timestamp'])
    op.create_index('idx_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])

def downgrade():
    # Drop indexes
    op.drop_index('idx_refresh_tokens_user_id')
    op.drop_index('idx_audit_log_timestamp')
    op.drop_index('idx_user_roles_user_id')
    op.drop_index('idx_user_groups_user_id')
    op.drop_index('idx_samples_group_id')

    # Drop RLS policies
    op.execute("DROP POLICY admin_bypass ON samples;")
    op.execute("DROP POLICY group_access ON samples;")
    op.execute("ALTER TABLE samples DISABLE ROW LEVEL SECURITY;")

    # Drop tables
    op.drop_table('samples')
    op.drop_table('refresh_tokens')
    op.drop_table('audit_log')
    op.drop_table('user_groups')
    op.drop_table('user_roles')
    op.drop_table('groups')
    op.drop_table('roles')
    op.drop_table('users')

    # Drop extensions
    op.execute("DROP EXTENSION IF EXISTS pgcrypto;")
    op.execute("DROP EXTENSION IF EXISTS uuid-ossp;")