import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTablePageEvent } from 'primereact/datatable';
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

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
}

interface ApiResponse {
  pagination: PaginationInfo;
  data: Artwork[];
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const result: ApiResponse = await response.json();
      
      setArtworks(result.data);
      setTotalRecords(result.pagination.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(1);
  }, []);

  const onPageChange = (event: DataTablePageEvent) => {
    const newPage = Math.floor(event.first / event.rows) + 1;
    fetchArtworks(newPage);
  };

  return (
    <div className="app-container">
      <h1>Art Institute of Chicago - Artworks</h1>
      
      <div className="datatable-wrapper">
        <DataTable 
          value={artworks} 
          loading={loading}
          lazy
          paginator 
          first={(currentPage - 1) * 12}
          rows={12}
          totalRecords={totalRecords}
          onPage={onPageChange}
          tableStyle={{ minWidth: '60rem' }}
          stripedRows
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} artworks"
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
