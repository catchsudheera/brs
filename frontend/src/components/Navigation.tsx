import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-semibold">Badminton Almere</div>
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="hover:text-gray-200">
            Ranking
          </Link>
        </li>
        <li>
          <Link href="/player-ranking-history" className="hover:text-gray-200">
            Ranking History
          </Link>
        </li>
        <li>
          <Link href="/player-encounters" className="hover:text-gray-200">
            Encounters
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
