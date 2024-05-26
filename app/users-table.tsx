'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { SelectUser } from '@/lib/db';
import { deleteUser } from './actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function UsersTable({
  users,
  offset
}: {
  users: SelectUser[];
  offset: number | null;
}) {
  const router = useRouter();

  function onClick() {
    router.replace(`/?offset=${offset}`);
  }

  return (
    <>
      <form className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[150px]">Name</TableHead>
              {/* <TableHead className="hidden md:table-cell">Username</TableHead> */}
              <TableHead className="hidden md:table-cell">Rank</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>
      </form>
      {offset !== null && (
        <Button
          className="mt-4 w-40"
          variant="secondary"
          onClick={() => onClick()}
        >
          Next Page
        </Button>
      )}
    </>
  );
}

function UserRow({ user }: { user: SelectUser }) {
  const userId = user.id;
  const deleteUserWithId = deleteUser.bind(null, userId);

  return (
    <TableRow>
      <TableCell>
        <Image
          className="h-8 w-8 rounded-full"
          src={user.imageUrl!}
          height={32}
          width={32}
          alt={`${user.name} avatar`}
        />
      </TableCell>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.rank ? user.rank : '당첨되지 않음'}</TableCell>
      <TableCell>
        <Button
          className="w-full"
          size="sm"
          variant="outline"
          formAction={deleteUserWithId}
        >
          1등 예상
        </Button>
      </TableCell>
    </TableRow>
  );
}
