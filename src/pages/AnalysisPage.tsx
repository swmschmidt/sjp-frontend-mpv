import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Button,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchUnits } from '../services/unitService';
import { fetchItems } from '../services/itemService';
import makeStyles from '@mui/styles/makeStyles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const useStyles = makeStyles(() => ({
    container: {
        maxWidth: '100%',
        width: '90%',
        margin: '0 auto',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#fff',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        overflowX: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableContainer: {
        flexGrow: 1,
        overflow: 'auto',
        width: '100%',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        fontSize: '16px',
    },
    tableHead: {
        backgroundColor: 'var(--primary-blue)',
    },
    tableCell: {
        padding: '12px 14px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
        whiteSpace: 'nowrap',
        cursor: 'default',
        color: 'white',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    tableBodyRow: {
        '&:hover': {
            backgroundColor: '#e6f0fa',
        },
        '&:nth-of-type(even)': {
            backgroundColor: '#fafafa',
        },
    },
    tableBodyCell: {
        padding: '12px 14px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
        whiteSpace: 'nowrap',
        cursor: 'default',
    },
}));

const columns: GridColDef[] = [
    { field: 'itemId', headerName: 'ID', flex: 1 },
    { field: 'item', headerName: 'Item', flex: 1 },
    { field: 'daysLeft', headerName: 'Dias Restantes', type: 'number', flex: 1 },
    { field: 'meanDailyConsumption', headerName: 'Consumo Diário Médio', flex: 1 },
    { field: 'totalQuantity', headerName: 'Quantidade Total', type: 'number', flex: 1 },
];

const AnalysisPage = () => {
    const { unitId } = useParams<{ unitId: string }>();
    const navigate = useNavigate();
    const [items, setItems] = useState<{ [key: string]: any }>({});
    const [daysLeftData, setDaysLeftData] = useState<{ [key: string]: any[] }>({});
    const [unitName, setUnitName] = useState<string>('');
    const [, setUnitsDictionary] = useState<{ [key: string]: string }>({});
    const classes = useStyles();

    useEffect(() => {
        if (!unitId) return;

        const fetchItemsData = async () => {
            const itemsData = await fetchItems();
            const itemsMap = itemsData.reduce((acc: any, item: any) => {
                acc[item.id] = item;
                return acc;
            }, {});
            setItems(itemsMap);
        };

        const fetchDaysLeftData = async () => {
            const response = await fetch(`https://flask-app-rough-glitter-6700.fly.dev/restock/days_left/${unitId}`);
            const data = await response.json();
            setDaysLeftData({ [unitId]: data });
        };

        const fetchUnitsDictionary = async () => {
            const units = await fetchUnits();
            const dictionary = units.reduce((acc: { [key: string]: string }, unit: any) => {
                acc[unit.id] = unit.name;
                return acc;
            }, {});
            setUnitsDictionary(dictionary);
            setUnitName(dictionary[unitId]);
        };

        fetchItemsData();
        fetchDaysLeftData();
        fetchUnitsDictionary();
    }, [unitId]);

    const handleBackClick = () => {
        navigate('/analise');
    };

    if (!unitId) {
        return <Typography variant="h6">Unidade não encontrada.</Typography>;
    }

    return (
        <Container className={classes.container}>
            <Typography variant="h4" component="h1" gutterBottom>
                Análise de Estoque para {unitName}
            </Typography>
            <Button onClick={handleBackClick} startIcon={<ArrowBackIcon />} variant="contained" style={{ backgroundColor: '#003366', color: 'white' }}>
                Voltar
            </Button>
            <div style={{ height: 1000, width: '90%', marginTop: '20px' }}>
                <DataGrid
                    rows={daysLeftData[unitId]?.map((item, index) => ({
                        id: index,
                        itemId: item.item_id,
                        item: items[item.item_id]?.name || item.item_id,
                        daysLeft: item.days_left.toFixed(2),
                        meanDailyConsumption: item.mean_daily_consumption,
                        totalQuantity: item.total_quantity,
                    })) || []}
                    columns={columns}
                    disableRowSelectionOnClick
                />
            </div>
        </Container>
    );
};

export default AnalysisPage;