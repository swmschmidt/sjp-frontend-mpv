import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    Typography,
    TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/global.css';
import FloatingHelpButton from '../components/FloatingHelpButton';
import FloatingFeedbackButton from '../components/FloatingFeedbackButton';
//import '../styles/options.css';

interface Item {
    item_id: string;
    min_stock: string;
    max_stock: string;
    mean_daily_consumption: string;
    minimum_possible_quantity: string;
}

const OptionsPage = () => {
    const { unitId } = useParams<{ unitId: string }>();
    const [inventorySettings, setInventorySettings] = useState<{ [key: string]: Item[] }>({});
    const [items, setItems] = useState<{ [key: string]: any }>({});
    const [editableItemId, setEditableItemId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
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

        fetchItemsData();
    }, []);

    useEffect(() => {
        const fetchSettingsData = async () => {
            if (unitId) {
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
                } catch (error) {
                    console.error('Error fetching settings or overrides:', error);
                }
            }
        };

        fetchSettingsData();
    }, [unitId]);

    const handleBackClick = () => {
        navigate('/opcoes');
    };

    const handleSettingChange = (unitId: string, itemId: string, field: string, newValue: string) => {
        setInventorySettings((prev) => ({
            ...prev,
            [unitId]: prev[unitId].map((item) =>
                item.item_id === itemId ? { ...item, [field]: newValue } : item
            ),
        }));
    };

    const handleSaveClick = async (unitId: string, newValue: Item) => {
        try {
            await fetch('https://flask-app-rough-glitter-6700.fly.dev/settings_override', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    unit_id: unitId,
                    ...newValue,
                }),
            });
            setEditableItemId(null);
        } catch (error) {
            console.error('Error saving override:', error);
        }
    };

    const handleResetClick = async (unitId: string, itemId: string) => {
        try {
            await fetch(`https://flask-app-rough-glitter-6700.fly.dev/settings_override/item?unit_id=${unitId}&item_id=${itemId}`, {
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
            setEditableItemId(null);
        } catch (error) {
            console.error('Error resetting override:', error);
        }
    };

    const handleEditClick = (itemId: string) => {
        setEditableItemId(itemId);
    };

    return (
        <Container maxWidth="xl" sx={{ padding: 0, width: '100%', overflow: 'visible' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Configurações de Inventário
            </Typography>
            <div>
                <Button onClick={handleBackClick} startIcon={<ArrowBackIcon />} variant="contained" sx={{ backgroundColor: '#003366' }}>
                    Voltar
                </Button>
                <TableContainer component={Paper} sx={{ padding: 0, maxHeight: '100%', maxWidth: '100%', overflow: 'visible' }}>
                    <Table className="data-table" stickyHeader sx={{ minWidth: 1200 }}>
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
                            {unitId && inventorySettings[unitId]?.map((item) => (
                                <TableRow key={item.item_id}>
                                    <TableCell>{items[item.item_id]?.name || item.item_id}</TableCell>
                                    <TableCell>
                                        <TextField
                                            value={item.min_stock}
                                            onChange={(e) => handleSettingChange(unitId, item.item_id, 'min_stock', e.target.value)}
                                            disabled={editableItemId !== item.item_id}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={item.max_stock}
                                            onChange={(e) => handleSettingChange(unitId, item.item_id, 'max_stock', e.target.value)}
                                            disabled={editableItemId !== item.item_id}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={item.mean_daily_consumption}
                                            onChange={(e) => handleSettingChange(unitId, item.item_id, 'mean_daily_consumption', e.target.value)}
                                            disabled={editableItemId !== item.item_id}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={item.minimum_possible_quantity}
                                            onChange={(e) => handleSettingChange(unitId, item.item_id, 'minimum_possible_quantity', e.target.value)}
                                            disabled={editableItemId !== item.item_id}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {editableItemId === item.item_id ? (
                                            <>
                                                <Button onClick={() => handleSaveClick(unitId, item)} variant="contained" color="primary">
                                                    Salvar
                                                </Button>
                                                <Button onClick={() => handleResetClick(unitId, item.item_id)} variant="contained" color="secondary">
                                                    Resetar configurações padrão
                                                </Button>
                                            </>
                                        ) : (
                                            <Button onClick={() => handleEditClick(item.item_id)} variant="contained" color="primary">
                                                Editar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <FloatingFeedbackButton />
                <FloatingHelpButton description="Na página de opções você pode mudar as configurações de estoque e médias de consumo que serão
                      utilizadas nos cálculos dos pedidos de cada unidade. </br> Para editar, clique no botão 'Editar', mude os valores, e então clique em 
                      'Salvar'. </br></br>
                      'Estoque mínimo' é o ponto que o sistema vai considerar que um item precisa ser pedido novamente. Por exemplo, se o estoque mínimo for 500,
                      e existem 600 comprimidos em estoque, ele não será incluído no pedido. Se o estoque for menor que 500 comprimidos, ele será incluído.
                      </br></br>
                      'Estoque máximo' será usado pelo sistema para calcular quanto pedir do medicamento. O cálculo será 'Estoque Máximo - Estoque Atual = Quantidade a pedir'.
                      </br></br>
                      'Quantidade média diária' é usada na página de análise para calcular por quantos dias o estoque ainda irá durar. Por padrão, todas as quantidades médias
                      diárias foram calculadas a partir da média de saída do último ano.
                      </br></br>
                      'Quantidade mínima possível' será usada pelo sistema quando for calcular o pedido. A quantidade que o sistema irá calcular sempre será um múltiplo
                      dessa opção. Por exemplo, se o medicamento vem em blisters de 12 comprimidos, você pode alterar essa quantidade para que o pedido seja exatamente
                      em múltiplos de 12, ou também, quantidade maiores, como caixas de 500 comprimidos, etc." />
            </div>
        </Container>
    );
};

export default OptionsPage;