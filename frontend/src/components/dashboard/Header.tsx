import { format } from 'date-fns';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export const DashboardHeader = () => {
  const { data: session } = useSession();
  const currentTime = new Date();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 mb-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {format(currentTime, 'EEEE, MMMM d, yyyy')} at {format(currentTime, 'h:mm:ss aa')}
        </p>
      </div>
      
      <div className="flex items-center gap-3 border-t sm:border-none pt-4 sm:pt-0">
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt="Profile"
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-emerald-500/20"
            priority
          />
        )}
        <div className="flex-1 sm:text-right">
          <p className="text-sm font-medium">{session?.user?.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-none">
              {session?.user?.email}
            </p>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="btn btn-sm btn-error btn-outline text-xs normal-case"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 