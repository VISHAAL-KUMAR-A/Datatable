import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string | null;
  date_start: number;
  date_end: number;
}

interface ApiArtwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string | null;
  date_start: number;
  date_end: number;
}

interface ApiResponse {
  data: ApiArtwork[];
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch the data from the API
    fetch('https://api.artic.edu/api/v1/artworks?page=1')
      .then(response => response.json() as Promise<ApiResponse>)
      .then((data) => {
        // extract only the fields we need
        const filtered = data.data.map((item: ApiArtwork) => ({
          id: item.id,
          title: item.title,
          place_of_origin: item.place_of_origin,
          artist_display: item.artist_display,
          inscriptions: item.inscriptions,
          date_start: item.date_start,
          date_end: item.date_end
        }));
        setArtworks(filtered);
        setLoading(false);
      })
      .catch(error => {
        console.log('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <h1>Art Institute of Chicago - Artworks</h1>
      
      <div className="datatable-wrapper">
        <DataTable 
          value={artworks} 
          loading={loading}
          paginator 
          rows={10}
          tableStyle={{ minWidth: '60rem' }}
          stripedRows
        >
          <Column field="title" header="Title" style={{ width: '20%' }}></Column>
          <Column field="artist_display" header="Artist" style={{ width: '20%' }}></Column>
          <Column field="place_of_origin" header="Place of Origin" style={{ width: '15%' }}></Column>
          <Column field="date_start" header="Start Year" style={{ width: '10%' }}></Column>
          <Column field="date_end" header="End Year" style={{ width: '10%' }}></Column>
          <Column field="inscriptions" header="Inscriptions" style={{ width: '25%' }}></Column>
        </DataTable>
      </div>
    </div>
  );
}

export default App;
