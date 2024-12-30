import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUnits } from '../services/unitService';
import { Unit } from '../types/Unit';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FloatingHelpButton from '../components/FloatingHelpButton';

const OptionsSelectPage = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnitsData = async () => {
      const unitsData = await fetchUnits();
      setUnits(unitsData);
    };

    fetchUnitsData();
  }, []);

  const handleUnitSelect = (_: any, value: Unit | null) => {
    if (value) {
      navigate(`/opcoes/${value.internal_id}`);
    }
  };

  return (
    <div className="container">
      <h1>Configurações de Unidade</h1>
      <Autocomplete
        options={units}
        getOptionLabel={(option) => option.name}
        onChange={handleUnitSelect}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Procurar por unidade"
            fullWidth
            helperText="Digite ou selecione uma unidade"
          />
        )}
        sx={{ width: '30%' }}
      />
                      <FloatingHelpButton description="Na página de opções você pode mudar as configurações de estoque e médias de consumo que serão
                      utilizadas nos cálculos dos pedidos de cada unidade." />
    </div>
  );
};

export default OptionsSelectPage;
