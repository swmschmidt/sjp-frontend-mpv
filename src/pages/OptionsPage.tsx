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
    TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/global.css';
//import '../styles/options.css';

const OptionsPage = () => {
    const [units, setUnits] = useState<any[]>([]);
    const [inventorySettings, setInventorySettings] = useState<{ [key: string]: any[] }>({});
    const [items, setItems] = useState<{ [key: string]: any }>({});
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

    useEffect(() => {
        const fetchUnitsData = async () => {
            try {
                const response = await fetch('https://flask-app-rough-glitter-6700.fly.dev/units');
                const unitsData = await response.json();
                console.log('Fetched units:', unitsData);
                setUnits(unitsData);
            } catch (error) {
                console.error('Error fetching units:', error);
            }
        };

        const fetchItemsData = async () => {
            try {
                const response = await fetch('https://flask-app-rough-glitter-6700.fly.dev/items');
                const itemsData = await response.json();
                console.log('Fetched items:', itemsData);
                const itemsMap = itemsData.reduce((acc: any, item: any) => {
                    acc[item.id] = item;
                    return acc;
                }, {});
                setItems(itemsMap);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchUnitsData();
        fetchItemsData();
    }, []);

    const handleUnitClick = async (unitId: string) => {
        try {
            const settingsResponse = await fetch(`https://flask-app-rough-glitter-6700.fly.dev/restock/settings/${unitId}`);
            const settings = await settingsResponse.json();
            console.log('Fetched settings:', settings);

            const overridesResponse = await fetch(`https://flask-app-rough-glitter-6700.fly.dev/settings_override/all`);
            const overridesData = await overridesResponse.json();
            console.log('Fetched overrides:', overridesData);

            const overrides = overridesData.overrides || [];
            if (!Array.isArray(overrides)) {
                throw new Error('Overrides response is not an array');
            }

            const mergedSettings = settings.map((setting: any) => {
                const override = overrides.find((o: any) => o.unit_id === unitId && o.item_id === setting.item_id);
                return override ? { ...setting, ...override } : setting;
            });

            console.log('Merged settings:', mergedSettings);
            setInventorySettings((prev) => ({ ...prev, [unitId]: mergedSettings }));
            setSelectedUnit(unitId);
        } catch (error) {
            console.error('Error fetching settings or overrides:', error);
        }
    };

    const handleBackClick = () => {
        setSelectedUnit(null);
    };

    const handleSettingChange = (unitId: string, itemId: string, field: string, newValue: string) => {
        setInventorySettings((prev) => ({
            ...prev,
            [unitId]: prev[unitId].map((item) =>
                item.item_id === itemId ? { ...item, [field]: newValue } : item
            ),
        }));
    };

    const handleSaveClick = async (unitId: string, itemId: string, newValue: any) => {
        try {
            await fetch('https://flask-app-rough-glitter-6700.fly.dev/settings_override', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    unit_id: unitId,
                    item_id: itemId,
                    ...newValue,
                }),
            });
        } catch (error) {
            console.error('Error saving override:', error);
        }
    };

    const handleResetClick = async (unitId: string, itemId: string, field: string) => {
        try {
            await fetch(`https://flask-app-rough-glitter-6700.fly.dev/settings_override/field?unit_id=${unitId}&item_id=${itemId}&field=${field}`, {
                method: 'DELETE',
            });

            const settingsResponse = await fetch(`https://flask-app-rough-glitter-6700.fly.dev/restock/settings/${unitId}`);
            const settings = await settingsResponse.json();
            const overridesResponse = await fetch(`https://flask-app-rough-glitter-6700.fly.dev/settings_override/all`);
            const overridesData = await overridesResponse.json();

            const overrides = overridesData.overrides || [];
            if (!Array.isArray(overrides)) {
                throw new Error('Overrides response is not an array');
            }

            const mergedSettings = settings.map((setting: any) => {
                const override = overrides.find((o: any) => o.unit_id === unitId && o.item_id === setting.item_id);
                return override ? { ...setting, ...override } : setting;
            });

            setInventorySettings((prev) => ({ ...prev, [unitId]: mergedSettings }));
        } catch (error) {
            console.error('Error resetting override:', error);
        }
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Configurações de Inventário
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
                                    <TableCell>Min Stock</TableCell>
                                    <TableCell>Max Stock</TableCell>
                                    <TableCell>Mean Daily Consumption</TableCell>
                                    <TableCell>Minimum Possible Quantity</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inventorySettings[selectedUnit]?.map((item) => (
                                    <TableRow key={item.item_id}>
                                        <TableCell>{items[item.item_id]?.name || item.item_id}</TableCell>
                                        <TableCell>
                                            <TextField
                                                value={item.min_stock}
                                                onChange={(e) => handleSettingChange(selectedUnit, item.item_id, 'min_stock', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={item.max_stock}
                                                onChange={(e) => handleSettingChange(selectedUnit, item.item_id, 'max_stock', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={item.mean_daily_consumption}
                                                onChange={(e) => handleSettingChange(selectedUnit, item.item_id, 'mean_daily_consumption', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={item.minimum_possible_quantity}
                                                onChange={(e) => handleSettingChange(selectedUnit, item.item_id, 'minimum_possible_quantity', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleSaveClick(selectedUnit, item.item_id, item)} variant="contained" color="primary">
                                                Salvar
                                            </Button>
                                            <Button onClick={() => handleResetClick(selectedUnit, item.item_id, 'min_stock')} variant="contained" color="secondary">
                                                Resetar Min
                                            </Button>
                                            <Button onClick={() => handleResetClick(selectedUnit, item.item_id, 'max_stock')} variant="contained" color="secondary">
                                                Resetar Max
                                            </Button>
                                            <Button onClick={() => handleResetClick(selectedUnit, item.item_id, 'mean_daily_consumption')} variant="contained" color="secondary">
                                                Resetar MDC
                                            </Button>
                                            <Button onClick={() => handleResetClick(selectedUnit, item.item_id, 'minimum_possible_quantity')} variant="contained" color="secondary">
                                                Resetar MPQ
                                            </Button>
                                        </TableCell>
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
                                <TableCell>Configurações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {units.map((unit) => (
                                <TableRow key={unit.internal_id}>
                                    <TableCell>{unit.name || unit.internal_id}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleUnitClick(unit.internal_id)}>
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

export default OptionsPage;