import { useEffect, useState } from 'react';
import {
    Container,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { fetchUnits } from '../services/unitService';
import { fetchItems } from '../services/itemService';
import { Unit } from '../types/Unit';
import '../styles/global.css';
import '../styles/analysis.css';

const AnalysisPage = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [items, setItems] = useState<{ [key: string]: any }>({});
    const [daysLeftData, setDaysLeftData] = useState<{ [key: string]: any[] }>({});
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

    useEffect(() => {
        const fetchUnitsData = async () => {
            const unitsData = await fetchUnits();
            setUnits(unitsData);
        };

        const fetchItemsData = async () => {
            const itemsData = await fetchItems();
            const itemsMap = itemsData.reduce((acc: any, item: any) => {
                acc[item.id] = item;
                return acc;
            }, {});
            setItems(itemsMap);
        };

        fetchUnitsData();
        fetchItemsData();
    }, []);

    const handleIconClick = async (unitId: string) => {
        const response = await fetch(`https://flask-app-rough-glitter-6700.fly.dev/restock/days_left/${unitId}`);
        const data = await response.json();
        setDaysLeftData((prev) => ({ ...prev, [unitId]: data }));
        setSelectedUnit(unitId);
    };

    const handleBackClick = () => {
        setSelectedUnit(null);
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Análise de Estoque
            </Typography>
            {selectedUnit ? (
                <div>
                    <Button onClick={handleBackClick} startIcon={<ArrowBackIcon />} variant="contained" color="primary">
                        Voltar
                    </Button>
                    <TableContainer component={Paper}>
                        <Table className="data-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item</TableCell>
                                    <TableCell>Dias Restantes</TableCell>
                                    <TableCell>Consumo Diário Médio</TableCell>
                                    <TableCell>Quantidade Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {daysLeftData[selectedUnit]?.map((item) => (
                                    <TableRow key={item.item_id}>
                                        <TableCell>{items[item.item_id]?.name || item.item_id}</TableCell>
                                        <TableCell>{item.days_left.toFixed(2)}</TableCell>
                                        <TableCell>{item.mean_daily_consumption}</TableCell>
                                        <TableCell>{item.total_quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            ) : (
                <div className="data-table-wrapper">
                    <Table className="data-table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Unidade</TableCell>
                                <TableCell>Detalhes</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {units.map((unit) => (
                                <TableRow key={unit.id}>
                                    <TableCell>{unit.name}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleIconClick(unit.id)}>
                                            <SearchIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default AnalysisPage;