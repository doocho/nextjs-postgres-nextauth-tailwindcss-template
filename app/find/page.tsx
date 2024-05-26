import { auth } from '@/lib/auth';
import { getUsers, updateTreasureByRank } from '@/lib/db';

export default async function IndexPage({
  searchParams
}: {
  searchParams: { code: string };
}) {
  const session = await auth();
  const search = searchParams.code ?? '';
  const rank = Buffer.from(search, 'base64').toString('utf-8');
  let success = true;
  let errorMessage = '';
  try {
    await updateTreasureByRank(Number(rank), session?.user?.name!);
  } catch (error: any) {
    success = false;
    errorMessage = error.message;
  }
  // alert('You have claimed your treasure!');
  // alert('You have claimed your treasure!');
  // const { users, newOffset } = await getUsers(search, Number(offset));

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center mb-8">
        <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
      </div>
      {success ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Congratulations!</h2>
            <p className="text-lg">You have claimed your treasure!</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Error!</h2>
            <p className="text-lg">{errorMessage}</p>
          </div>
        </div>
      )}
      {/* <div className="w-full mb-4">
        <Search value={searchParams.q} />
      </div> */}
      {/* <UsersTable users={users} offset={newOffset} /> */}
    </main>
  );
}
