// src/pages/OutOfStockPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/global.css';
import '../styles/outofstock.css';

const OutOfStockPage = () => {
    const { unitId } = useParams<{ unitId: string }>();
    const navigate = useNavigate();
    const [missingItems, setMissingItems] = useState<any[]>([]);
    const today = new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0];

    useEffect(() => {
        const fetchMissingItems = async () => {
            const response = await fetch(`https://flask-app-rough-glitter-6700.fly.dev/stock/out_of_stock/${unitId}/${today}`);
            const data = await response.json();
            setMissingItems(data.missing_items);
        };

        fetchMissingItems();
    }, [unitId]);

    const handleBackClick = () => {
        navigate('/faltas');
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Itens em falta
            </Typography>
            <Button onClick={handleBackClick} startIcon={<ArrowBackIcon />} variant="contained" sx={{ backgroundColor: '#003366' }}>
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
                        {missingItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default OutOfStockPage;
