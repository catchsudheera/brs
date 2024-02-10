import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-semibold">Badminton Almere</div>
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="hover:text-gray-200">
            Player Ranking
          </Link>
        </li>
        <li>
          <Link href="/player-ranking-history" className="hover:text-gray-200">
            History
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
