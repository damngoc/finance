import React from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { Avatar, Badge, Button, Input } from '@/shared/components'

const ClientProfilePage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
          <Avatar name={user?.name || ''} size="lg" />
          <div>
            <h2 className="font-semibold text-slate-800 text-lg">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <Badge variant="blue" >{user?.role}</Badge>
          </div>
          <Button variant="secondary" size="sm" className="ml-auto">Đổi ảnh</Button>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Họ tên" defaultValue={user?.name} />
            <Input label="Email" type="email" defaultValue={user?.email} />
          </div>
          <Input label="Số điện thoại" type="tel" placeholder="09xxxxxxxx" />
          <div className="flex justify-end">
            <Button>Lưu thay đổi</Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Đổi mật khẩu</h3>
        <form className="space-y-4">
          <Input label="Mật khẩu hiện tại" type="password" placeholder="••••••••" />
          <Input label="Mật khẩu mới" type="password" placeholder="••••••••" />
          <Input label="Xác nhận mật khẩu mới" type="password" placeholder="••••••••" />
          <div className="flex justify-end">
            <Button>Cập nhật mật khẩu</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientProfilePage
