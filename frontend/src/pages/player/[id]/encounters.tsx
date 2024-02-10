import { useRouter } from 'next/router';

const PlayerEncounters = () => {
  const router = useRouter();
  const { id } = router.query; // Access the dynamic segment value

  // You can use this ID to fetch data or perform other actions
  return (
    <div>
      <h1>Player Encounters</h1>
      <p>Showing encounters for player with ID: {id}</p>
    </div>
  );
};

export default PlayerEncounters;