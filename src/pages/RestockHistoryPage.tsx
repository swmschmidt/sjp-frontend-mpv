import { useState, useEffect } from "react";
import { fetchUnits } from "../services/unitService";
import { fetchRestockSummed } from "../services/restockService";
import { Unit } from "../types/Unit";
import axios from "axios";
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
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import "../styles/global.css";
import FloatingFeedbackButton from "../components/FloatingFeedbackButton";
import FloatingHelpButton from "../components/FloatingHelpButton";

const RestockHistoryPage = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [restockData, setRestockData] = useState<{ [key: string]: any[] }>({});
  const [itemNames, setItemNames] = useState<{ [key: string]: string }>({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnitsData = async () => {
      const unitsData = await fetchUnits();
      setUnits(unitsData);
    };

    fetchUnitsData();
  }, []);

  useEffect(() => {
    const fetchRestockData = async () => {
      setLoading(true);
      const data = await fetchRestockSummed(date);
      const restockMap = data.reduce((acc, entry) => {
        if (!acc[entry.unit_id]) {
          acc[entry.unit_id] = [];
        }
        acc[entry.unit_id].push(entry);
        return acc;
      }, {} as { [key: string]: any[] });
      setRestockData(restockMap);
      setLoading(false);
    };

    fetchRestockData();
  }, [date]);

  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const response = await axios.get("https://flask-app-rough-glitter-6700.fly.dev/items");
        const items = response.data.reduce((acc: { [key: string]: string }, item: { id: string; name: string }) => {
          acc[item.id] = item.name;
          return acc;
        }, {});
        setItemNames(items);
      } catch (error) {
        console.error("Error fetching item names:", error);
      }
    };

    fetchItemNames();
  }, []);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  const handlePreviousDay = () => {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    setDate(previousDay.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    setDate(nextDay.toISOString().slice(0, 10));
  };

  const handleUnitClick = (unitId: string) => {
    setSelectedUnit(unitId);
  };

  const handleBackClick = () => {
    setSelectedUnit(null);
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Histórico de Pedidos
      </Typography>
      {!selectedUnit && (
        <div className="date-selector">
          <IconButton onClick={handlePreviousDay} disabled={loading}>
            <ArrowBackIcon />
          </IconButton>
          <TextField
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={loading}
          />
          <IconButton onClick={handleNextDay} disabled={loading}>
            <ArrowForwardIcon />
          </IconButton>
        </div>
      )}
      {loading ? (
        <div className="loading">
          <CircularProgress />
          <Typography variant="body1">Loading...</Typography>
        </div>
      ) : selectedUnit ? (
        <div>
          <Button onClick={handleBackClick} startIcon={<ArrowBackIcon />} variant="contained" color="primary">
            Voltar
          </Button>
          <Typography variant="h5" component="h2" gutterBottom>
            {units.find(unit => unit.id === selectedUnit)?.name}
          </Typography>
          <TableContainer component={Paper}>
            <Table className="data-table">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantidade Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {restockData[selectedUnit]?.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{itemNames[entry.item_id] || "Desconhecido"}</TableCell>
                    <TableCell>{entry.total_quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : (
        <div className="data-table-wrapper">
          {Object.keys(restockData).length === 0 ? (
            <Typography variant="body1">Nenhuma entrada nesta data</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table className="data-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Itens Restocados</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {units.map((unit) =>
                    restockData[unit.id] && (
                      <TableRow key={unit.id}>
                        <TableCell>{unit.name}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleUnitClick(unit.id)}>
                            <SearchIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
                            <FloatingFeedbackButton />
                            <FloatingHelpButton description="" />
        </div>
      )}
    </Container>
  );
};

export default RestockHistoryPage;
