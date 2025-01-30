import React, { useState } from "react";
import {
  TextField,
  Autocomplete,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "../styles/global.css";

interface Medication {
  name: string;
  dropsTotalPerFlask: number;
  scheduleType: string;
}

interface RowData {
  medication: Medication | null;
  date: Dayjs | null;
  frascos: number;
  dailyDose: number;
  returnDate: Dayjs | null;
  daysCovered: number | null;
}

const medications: Medication[] = [
  { name: "Clonazepam 2,5mg/mL", dropsTotalPerFlask: 500, scheduleType: "B1" },
  { name: "Fenobarbital 40 mg/mL", dropsTotalPerFlask: 800, scheduleType: "C1" },
  { name: "Haloperidol 2mg/mL", dropsTotalPerFlask: 400, scheduleType: "C1" },
  { name: "Levomepromazina 40mg/mL", dropsTotalPerFlask: 800, scheduleType: "C1" },
  { name: "Ácido Valproico 250mg/5mL", dropsTotalPerFlask: 100, scheduleType: "C1" },
  { name: "Carbamazepina 20mg/mL", dropsTotalPerFlask: 100, scheduleType: "C1" },
  { name: "Insulina Frasco", dropsTotalPerFlask: 1000, scheduleType: "Sem controle especial" },
  { name: "Insulina Caneta", dropsTotalPerFlask: 300, scheduleType: "Sem controle especial" },
];

const MedicationTable: React.FC = () => {
  const [rows, setRows] = useState<RowData[]>([
    {
      medication: null,
      date: dayjs(),
      frascos: 1,
      dailyDose: 1,
      returnDate: null,
      daysCovered: null,
    },
  ]);

  const calculateValues = (index: number) => {
    setRows((prevRows) => {
      return prevRows.map((row, i) => {
        if (i !== index || !row.medication || !row.date || row.dailyDose <= 0) {
          return row;
        }
        const totalDoses = row.frascos * row.medication.dropsTotalPerFlask;
        const days = totalDoses / row.dailyDose;
        const returnDate = row.date.add(days, "day");
        return { ...row, returnDate, daysCovered: days };
      });
    });
  };

  const handleInputChange = (
    index: number,
    field: keyof RowData,
    value: any
  ) => {
    if (field === "frascos" || field === "dailyDose") {
      value = Math.max(0, value);
    }
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index] = { ...updatedRows[index], [field]: value };
      return updatedRows;
    });
    calculateValues(index);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="container">
        <div className="content">
          {rows.map((row, index) => (
            <Paper key={index} style={{ padding: "16px", marginBottom: "16px" }}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Autocomplete
                  options={medications}
                  getOptionLabel={(option) => option.name}
                  value={row.medication}
                  onChange={(_, newValue) =>
                    handleInputChange(index, "medication", newValue)
                  }
                  renderInput={(params) => <TextField {...params} label="Medicamento" />}
                  style={{ width: '300px' }}
                />
                {row.medication && (
                  <Typography variant="body2">
                    <strong>Tipo de controle:</strong> {row.medication.scheduleType}
                  </Typography>
                )}
                <Box style={{ width: '300px' }}>
                  <DatePicker
                    value={row.date}
                    onChange={(newDate) =>
                      handleInputChange(index, "date", newDate)
                    }
                    label="Data de entrega"
                    format="DD/MM/YYYY"
                  />
                </Box>
                <TextField
                  type="number"
                  value={row.frascos}
                  onChange={(e) =>
                    handleInputChange(index, "frascos", Number(e.target.value))
                  }
                  label="Quantidade de Frascos"
                  style={{ width: '300px' }}
                />
                <TextField
                  type="number"
                  value={row.dailyDose}
                  onChange={(e) =>
                    handleInputChange(index, "dailyDose", Number(e.target.value))
                  }
                  label={
                    row.medication?.name === "Ácido Valproico 250mg/5mL" ||
                    row.medication?.name === "Carbamazepina 20mg/mL"
                      ? "Dose diária (em mL)"
                      : "Dose Diária (gotas)"
                  }
                  style={{ width: '300px' }}
                />
                <Typography variant="h6">
                  <strong>Data de retorno estimada:</strong>{" "}
                  {row.returnDate ? row.returnDate.format("DD/MM/YYYY") : "-"}
                </Typography>
                <Typography variant="h6">
                  <strong>Total de dias de medicamento:</strong>{" "}
                  {row.daysCovered !== null ? row.daysCovered.toFixed(1) : "-"}
                </Typography>
                {row.daysCovered && row.daysCovered > 60 && row.medication?.scheduleType === "B1" && (
                  <Typography variant="h5" style={{ color: 'blue', fontWeight: 'bold' }}>
                    Medicamento da Lista B1. Não dispensar para mais de 60 dias de tratamento - Portaria 344/98 Art. 46. 
                  </Typography>
                )}
                {row.daysCovered && row.daysCovered > 60 && row.medication?.scheduleType === "C1" && (
                  <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                    Medicamento da lista C1: Não exceder quantidade para 60 dias de tratamento - Portaria 344/98 Art. 59. - Excessão: No caso de prescrição de substâncias ou medicamentos antiparkinsonianos e anticonvulsivantes, a quantidade ficará limitada até 6 meses de tratamento. 
                  </Typography>
                )}
                {row.medication &&
                  row.medication.name !== "Ácido Valproico 250mg/5mL" &&
                  row.medication.name !== "Carbamazepina 20mg/mL" && (
                    <Typography variant="body2">
                      <strong>Total de gotas em 1 frasco de {row.medication.name} segundo bula:</strong> {row.medication.dropsTotalPerFlask}
                    </Typography>
                  )}
              </Box>
            </Paper>
          ))}
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default MedicationTable;
