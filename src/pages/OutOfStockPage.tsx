// src/pages/OutOfStockPage.tsx
import { useEffect, useState } from 'react';
import { fetchUnits } from '../services/unitService';
import { Unit } from '../types/Unit';
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
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/global.css';
import '../styles/outofstock.css';

const OutOfStockPage = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [missingItems, setMissingItems] = useState<{ [key: string]: any[] }>({});
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const today = new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0];

    useEffect(() => {
        const fetchUnitsData = async () => {
            const unitsData = await fetchUnits();
            setUnits(unitsData);
        };

        fetchUnitsData();
    }, []);

    const handleIconClick = async (unitId: string) => {
        const response = await fetch(`https://flask-app-rough-glitter-6700.fly.dev/stock/out_of_stock/${unitId}/${today}`);
        const data = await response.json();
        setMissingItems((prev) => ({ ...prev, [unitId]: data.missing_items }));
        setSelectedUnit(unitId);
    };

    const handleBackClick = () => {
        setSelectedUnit(null);
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Itens em falta
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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {missingItems[selectedUnit]?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
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
                                <TableCell>Itens em Falta</TableCell>
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

export default OutOfStockPage;
