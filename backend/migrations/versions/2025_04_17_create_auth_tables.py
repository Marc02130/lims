"""Create authentication and authorization tables

Revision ID: 2025_04_17
Revises: 
Create Date: 2025-04-17
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID
from datetime import datetime, UTC

revision = '2025_04_17'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String, nullable=False, unique=True),
        sa.Column('password_hash', sa.String, nullable=False),
        sa.Column('first_name', sa.String, nullable=False),
        sa.Column('last_name', sa.String, nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, default=False),
        sa.Column('created_at', sa.DateTime, nullable=False, default=lambda: datetime.now(UTC)),
        sa.Column('updated_at', sa.DateTime, nullable=True, onupdate=lambda: datetime.now(UTC)),
        sa.Column('locked_until', sa.DateTime, nullable=True),
    )
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, nullable=False, unique=True),
        sa.Column('permissions', JSONB, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, default=False),
    )
    op.create_table(
        'groups',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, nullable=False, unique=True),
        sa.Column('description', sa.String, nullable=True),
        sa.Column('parent_group_id', sa.Integer, sa.ForeignKey('groups.id'), nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, default=False),
    )
    op.create_table(
        'user_roles',
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('role_id', sa.Integer, sa.ForeignKey('roles.id'), primary_key=True),
        sa.Column('is_active', sa.Boolean, nullable=False, default=False),
    )
    op.create_table(
        'user_groups',
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('group_id', sa.Integer, sa.ForeignKey('groups.id'), primary_key=True),
        sa.Column('is_active', sa.Boolean, nullable=False, default=False),
    )
    op.create_table(
        'audit_log',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=True),
        sa.Column('action', sa.String, nullable=False),
        sa.Column('details', JSONB, nullable=True),
        sa.Column('timestamp', sa.DateTime, nullable=False, default=lambda: datetime.now(UTC)),
        sa.Column('updated_at', sa.DateTime, nullable=True, onupdate=lambda: datetime.now(UTC)),
    )
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token', UUID(as_uuid=True), nullable=False, unique=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('expires_at', sa.DateTime, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, default=lambda: datetime.now(UTC)),
        sa.Column('updated_at', sa.DateTime, nullable=True, onupdate=lambda: datetime.now(UTC)),
    )
    op.create_table(
        'samples',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('sample_id', sa.String, nullable=False, unique=True),
        sa.Column('group_id', sa.Integer, sa.ForeignKey('groups.id'), nullable=False),
        sa.Column('type', sa.String, nullable=False),
        sa.Column('status', sa.String, nullable=False),
        sa.Column('collected_on', sa.DateTime, nullable=True, onupdate=lambda: datetime.now(UTC)),
        sa.Column('disposed_on', sa.DateTime, nullable=True, onupdate=lambda: datetime.now(UTC)),
        sa.Column('created_at', sa.DateTime, nullable=False, default=lambda: datetime.now(UTC)),
        sa.Column('updated_at', sa.DateTime, nullable=True, onupdate=lambda: datetime.now(UTC)),
    )
    op.create_index('idx_samples_group_id', 'samples', ['group_id'])
    op.create_index('idx_user_groups_user_id', 'user_groups', ['user_id'])
    op.create_index('idx_user_roles_user_id', 'user_roles', ['user_id'])
    op.create_index('idx_audit_log_timestamp', 'audit_log', ['timestamp'])
    op.create_index('idx_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])

def downgrade():
    op.drop_index('idx_refresh_tokens_user_id')
    op.drop_index('idx_audit_log_timestamp')
    op.drop_index('idx_user_roles_user_id')
    op.drop_index('idx_user_groups_user_id')
    op.drop_index('idx_samples_group_id')
    op.execute("DROP POLICY admin_bypass ON samples;")
    op.execute("DROP POLICY group_access ON samples;")
    op.execute("ALTER TABLE samples DISABLE ROW LEVEL SECURITY;")
    op.drop_table('samples')
    op.drop_table('refresh_tokens')
    op.drop_table('audit_log')
    op.drop_table('user_groups')
    op.drop_table('user_roles')
    op.drop_table('groups')
    op.drop_table('roles')
    op.drop_table('users')
    op.execute("DROP EXTENSION IF EXISTS pgcrypto;")
    op.execute("DROP EXTENSION IF EXISTS uuid-ossp;")