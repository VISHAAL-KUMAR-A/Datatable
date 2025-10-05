import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTablePageEvent, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
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
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [rowsToSelect, setRowsToSelect] = useState<number | null>(null);
  const overlayPanelRef = useRef<OverlayPanel>(null);

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

  const selectRowsCount = async () => {
    if (!rowsToSelect || rowsToSelect <= 0) return;

    const rowsPerPage = 12;
    const selected: Artwork[] = [];
    let remainingRows = rowsToSelect;
    let page = currentPage;

    while (remainingRows > 0) {
      try {
        const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
        const result: ApiResponse = await response.json();
        
        const rowsToTake = Math.min(remainingRows, result.data.length);
        selected.push(...result.data.slice(0, rowsToTake));
        remainingRows -= rowsToTake;

        if (result.data.length < rowsPerPage || remainingRows === 0) {
          break;
        }

        page++;
      } catch (error) {
        console.error('Failed to fetch artworks for selection:', error);
        break;
      }
    }

    setSelectedArtworks(selected);
    overlayPanelRef.current?.hide();
  };

  const selectionHeaderTemplate = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Button 
          icon="pi pi-chevron-down" 
          onClick={(e) => overlayPanelRef.current?.toggle(e)}
          className="p-button-sm"
          style={{ 
            padding: '0.25rem', 
            width: '1.5rem', 
            height: '1.5rem',
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            color: 'white'
          }}
          aria-label="Select rows options"
        />
      </div>
    );
  };

  return (
    <div className="app-container">
      <h1>Art Institute of Chicago - Artworks</h1>
      
      {selectedArtworks.length > 0 && (
        <div className="selection-info">
          <strong>{selectedArtworks.length}</strong> artwork{selectedArtworks.length !== 1 ? 's' : ''} selected
        </div>
      )}
      
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
          selection={selectedArtworks}
          onSelectionChange={(e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => setSelectedArtworks(e.value)}
          selectionMode="multiple"
          dataKey="id"
          tableStyle={{ minWidth: '60rem' }}
          stripedRows
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} artworks"
        >
          <Column selectionMode="multiple" header={selectionHeaderTemplate} headerStyle={{ width: '4rem' }}></Column>
          <Column field="title" header="Title" style={{ width: '20%' }}></Column>
          <Column field="artist_display" header="Artist" style={{ width: '20%' }}></Column>
          <Column field="place_of_origin" header="Place of Origin" style={{ width: '15%' }}></Column>
          <Column field="date_start" header="Start Year" style={{ width: '10%' }}></Column>
          <Column field="date_end" header="End Year" style={{ width: '10%' }}></Column>
          <Column field="inscriptions" header="Inscriptions" style={{ width: '25%' }}></Column>
        </DataTable>

        <OverlayPanel ref={overlayPanelRef} showCloseIcon>
          <div style={{ padding: '1rem', minWidth: '250px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Select Rows</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="rowCount" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Number of rows to select:
              </label>
              <InputNumber 
                id="rowCount"
                value={rowsToSelect} 
                onValueChange={(e) => setRowsToSelect(e.value ?? null)}
                min={1}
                max={totalRecords}
                showButtons
                style={{ width: '100%' }}
              />
            </div>
            <Button 
              label="Select Rows" 
              icon="pi pi-check" 
              onClick={selectRowsCount}
              style={{ width: '100%' }}
              disabled={!rowsToSelect || rowsToSelect <= 0}
            />
          </div>
        </OverlayPanel>
      </div>
    </div>
  );
}

export default App;
