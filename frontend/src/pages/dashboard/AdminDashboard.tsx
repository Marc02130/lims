import { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../../App';
import { getToken } from '../../utils/auth';

interface AdminDashboardProps {
  user: User;
  setMessage: (msg: string) => void;
  setError: (err: string) => void;
}

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  details: any;
  timestamp: string;
}

interface Group {
  id: number;
  name: string;
}

const API_BASE_URL = 'http://localhost:8000/api/auth';

const AdminDashboard: React.FC<AdminDashboardProps> = ({setMessage, setError }) => {
  const [pendingUsers, setPendingUsers] = useState<
    { id: number; email: string; is_active: boolean }[]
  >([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [assignRole, setAssignRole] = useState('');
  const [assignGroup, setAssignGroup] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const [usersRes, logsRes, rolesRes, groupsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/users?status=pending`, { headers }),
          axios.get(`${API_BASE_URL}/audit-logs`, { headers }),
          axios.get(`${API_BASE_URL}/roles`, { headers }),
          axios.get(`${API_BASE_URL}/groups`, { headers }),
        ]);
        setPendingUsers(usersRes.data.users || []);
        setAuditLogs(logsRes.data.logs || []);
        setRoles(rolesRes.data.roles || []);
        setGroups(groupsRes.data.groups || []);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (userId: number) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/users/${userId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
      setMessage(`User ${userId} approved`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Approval failed');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !assignRole) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/users/${selectedUserId}/roles`,
        { role: assignRole },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setMessage(`Role ${assignRole} assigned to user ${selectedUserId}`);
      setAssignRole('');
      setSelectedUserId(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Role assignment failed');
    }
  };

  const handleAssignGroup = async () => {
    if (!selectedUserId || !assignGroup) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/users/${selectedUserId}/groups`,
        { group_id: parseInt(assignGroup) },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setMessage(`Group ${assignGroup} assigned to user ${selectedUserId}`);
      setAssignGroup('');
      setSelectedUserId(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Group assignment failed');
    }
  };

  const handleRevokeSession = async (userId: number | null) => {
    if (!userId) return;
    try {
      await axios.delete(`${API_BASE_URL}/sessions/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMessage(`Sessions revoked for user ${userId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Session revocation failed');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      <h3 className="text-xl font-semibold mb-2">Pending User Approvals</h3>
      {pendingUsers.length === 0 ? (
        <p>No pending approvals</p>
      ) : (
        <ul className="mb-4">
          {pendingUsers.map((u) => (
            <li key={u.id} className="flex justify-between items-center p-2 border-b">
              <span>
                {u.email} (ID: {u.id})
              </span>
              <button
                onClick={() => handleApprove(u.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="text-xl font-semibold mb-2">Assign Roles/Groups</h3>
      <div className="mb-4">
        <label className="block text-gray-700">User ID</label>
        <input
          type="number"
          value={selectedUserId || ''}
          onChange={(e) => setSelectedUserId(parseInt(e.target.value) || null)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Assign Role</label>
        <select
          value={assignRole}
          onChange={(e) => setAssignRole(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button
          onClick={handleAssignRole}
          disabled={!selectedUserId || !assignRole}
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Assign Role
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Assign Group</label>
        <select
          value={assignGroup}
          onChange={(e) => setAssignGroup(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAssignGroup}
          disabled={!selectedUserId || !assignGroup}
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Assign Group
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Revoke User Sessions</h3>
      <div className="mb-4">
        <label className="block text-gray-700">User ID</label>
        <input
          type="number"
          value={selectedUserId || ''}
          onChange={(e) => setSelectedUserId(parseInt(e.target.value) || null)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={() => handleRevokeSession(selectedUserId)}
          disabled={!selectedUserId}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Revoke Sessions
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Audit Logs</h3>
      {auditLogs.length === 0 ? (
        <p>No audit logs available</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">ID</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Action</th>
              <th className="p-2">Details</th>
              <th className="p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="p-2">{log.id}</td>
                <td className="p-2">{log.user_id}</td>
                <td className="p-2">{log.action}</td>
                <td className="p-2">{JSON.stringify(log.details)}</td>
                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;