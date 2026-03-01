import React from 'react'
import { User } from '@/shared/types'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

const statusStyle: Record<User['status'], string> = {
  active:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  banned:   'bg-red-500/10 text-red-400 border-red-500/20',
}
const statusLabel: Record<User['status'], string> = {
  active: '● Hoạt động', inactive: '○ Không HĐ', banned: '✕ Bị khóa',
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-800">
          {['Username', 'Ngày đăng ký', 'IP đăng ký', 'IP đăng nhập', 'Họ tên NH', 'Số TK', 'Tên bank', 'Trạng thái', 'Thao tác'].map(h => (
            <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800/60">
        {users.map(user => (
          <tr key={user.id} className="hover:bg-gray-800/40 transition-colors group">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="font-medium text-gray-200 whitespace-nowrap">{user.username}</span>
              </div>
            </td>
            <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
              {new Date(user.createdAt).toLocaleDateString('vi-VN')}
            </td>
            <td className="px-4 py-3.5"><span className="font-mono text-xs text-gray-400">{user.registerIp}</span></td>
            <td className="px-4 py-3.5"><span className="font-mono text-xs text-blue-400">{user.lastLoginIp}</span></td>
            <td className="px-4 py-3.5 text-gray-300 text-xs whitespace-nowrap">{user.bankAccountName || '—'}</td>
            <td className="px-4 py-3.5"><span className="font-mono text-xs text-gray-400">{user.bankAccountNumber || '—'}</span></td>
            <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{user.bankName || '—'}</td>
            <td className="px-4 py-3.5">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle[user.status]}`}>
                {statusLabel[user.status]}
              </span>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(user)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-colors">
                  ✏ Sửa
                </button>
                <button onClick={() => onDelete(user)} className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-xs font-medium transition-all">
                  🗑 Xóa
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default UserTable