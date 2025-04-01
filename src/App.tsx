import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardActions,
  ThemeProvider,
  createTheme,
  CssBaseline,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { 
  Delete as DeleteIcon, 
  LocalCarWash, 
  EventNote, 
  Timer, 
  Add as AddIcon, 
  Edit as EditIcon,
  DirectionsCar as DirectionsCarIcon,
} from '@mui/icons-material'
import { format, differenceInDays } from 'date-fns'

interface Car {
  id: string
  name: string
  color: string
  make?: string
  model?: string
}

interface WashEntry {
  id: string
  date: Date
  type: 'Manual' | 'Drive-thru' | 'Detail'
  notes: string
  beforeImageUrl?: string | null
  afterImageUrl?: string | null
  treatments?: {
    [key: string]: boolean;
  }
}

// Define Standard Treatments
const standardTreatments = [
  'Pre-wash Foam',
  'Wheel Cleaner',
  'Tire Dressing',
  'Iron Remover',
  'Clay Bar',
  'Wax/Sealant',
  'Glass Cleaner',
  'Interior Vacuum',
  'Interior Detailer',
];

// --- Preset Car Definitions ---
const presetCars = [
  {
    make: 'Polestar',
    model: '2',
    name: 'Polestar 2',
    color: '#E4E6EF', // Silver
    image: '/PolestarimageCarRepresentation.png'
  },
  {
    make: 'Tesla',
    model: 'Model 3', // Example model
    name: 'Tesla Model 3',
    color: '#F3F6F9', // White
    image: '/TeslaImageCarRepresentation.png'
  },
  {
    make: 'BMW',
    model: 'M4', // Example model
    name: 'BMW M4',
    color: '#F3F6F9', // BMW Blue
    image: '/BmwImageCarRepresentation.png'
  },
  {
    make: 'Mercedes',
    model: 'AMG GT', // Example model
    name: 'Mercedes AMG GT',
    color: '#181C32', // Black
    image: '/MercedesImageCarRepresentation.png'
  },
];

const getChipColor = (type: WashEntry['type']) => {
  switch (type) {
    case 'Manual':
      return '#3699FF'
    case 'Drive-thru':
      return '#0BB783'
    case 'Detail':
      return '#8950FC'
    default:
      return '#3699FF'
  }
}

const carColors = [
  '#3699FF', // Blue
  '#F64E60', // Red
  '#0BB783', // Green
  '#8950FC', // Purple
  '#FFA800', // Yellow
  '#1BC5BD', // Teal
  '#E4E6EF', // Silver
  '#181C32', // Black
  '#F3F6F9', // White
  '#FF6B00', // Orange
]

// --- Theme Definitions ---
const baseThemeOptions = {
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid rgba(255, 255, 255, 0.1)' } } }
  },
};

const polestarTheme = createTheme({ 
  ...baseThemeOptions, 
  palette: { mode: 'dark', primary: { main: '#9E9E9E' }, secondary: { main: '#BDBDBD' }, background: { default: '#212121', paper: '#303030' }, text: { primary: '#E0E0E0', secondary: '#BDBDBD' }, divider: 'rgba(255, 255, 255, 0.12)' }, 
  components: { 
    ...baseThemeOptions.components, 
    MuiButton: { 
      styleOverrides: { 
        root: { textTransform: 'none', fontWeight: 600, padding: '8px 16px' }, 
        containedPrimary: { color: '#212121' }
      } 
    } 
  } 
});

const teslaTheme = createTheme({ 
  ...baseThemeOptions, 
  palette: { mode: 'light', primary: { main: '#CC0000' }, secondary: { main: '#616161' }, background: { default: '#F5F5F5', paper: '#FFFFFF' }, text: { primary: '#212121', secondary: '#757575' }, divider: 'rgba(0, 0, 0, 0.12)' }, 
  components: { 
    ...baseThemeOptions.components, 
    MuiButton: { 
      styleOverrides: { 
        root: { textTransform: 'none', fontWeight: 600, padding: '8px 16px' } 
      } 
    }, 
    MuiCard: { styleOverrides: { root: { border: '1px solid rgba(0, 0, 0, 0.12)' } } } 
  } 
});

const mercedesTheme = createTheme({ 
  ...baseThemeOptions, 
  palette: { mode: 'dark', primary: { main: '#B0B0B0' }, secondary: { main: '#00A3E0' }, background: { default: '#121212', paper: '#1E1E1E' }, text: { primary: '#FFFFFF', secondary: '#A0A0A0' }, divider: 'rgba(255, 255, 255, 0.1)' },
  components: { 
    ...baseThemeOptions.components, 
    MuiButton: { 
      styleOverrides: { 
        root: { textTransform: 'none', fontWeight: 600, padding: '8px 16px' } 
      } 
    } 
  } 
});

const bmwTheme = createTheme({ 
  ...baseThemeOptions, 
  palette: { 
    mode: 'dark', 
    primary: { main: '#0066CC' }, // Keep the BMW blue
    secondary: { main: '#888888' }, 
    // Changed background to dark blues
    background: { default: '#0A1929', paper: '#1C2536' }, // Dark Blue / Slightly Lighter Dark Blue
    text: { primary: '#FFFFFF', secondary: '#B0B0B0' }, 
    divider: 'rgba(255, 255, 255, 0.1)'
  },
  components: { 
    ...baseThemeOptions.components, 
    MuiButton: { 
      styleOverrides: { 
        root: { textTransform: 'none', fontWeight: 600, padding: '8px 16px' } 
      } 
    } 
  } 
});

// --- Helper Functions ---
const getThemeForMake = (make?: string) => {
  const lowerMake = make?.toLowerCase();
  if (lowerMake?.includes('tesla')) return teslaTheme;
  if (lowerMake?.includes('mercedes')) return mercedesTheme;
  if (lowerMake?.includes('bmw')) return bmwTheme;
  return polestarTheme;
};

const getImageForMake = (make?: string): string => {
  const lowerMake = make?.toLowerCase();
  if (lowerMake?.includes('tesla')) return '/TeslaImageCarReprentation.png';
  if (lowerMake?.includes('mercedes')) return '/MercedesImageCarRepresentation.png';
  if (lowerMake?.includes('bmw')) return '/BmwImageCarReprensetation.png';
  return '/PolestarimageCarRepresentation.png';
};

function App() {
  const [cars, setCars] = useState<Car[]>([{ id: '1', name: 'Polestar 2', make: 'Polestar', model: '2', color: '#E4E6EF' }])
  const [selectedCar, setSelectedCar] = useState<string>('1')
  const [entries, setEntries] = useState<{ [key: string]: WashEntry[] }>({})
  const [newEntry, setNewEntry] = useState<Partial<WashEntry>>({
    date: new Date(),
    type: 'Manual',
    notes: '',
    beforeImageUrl: null,
    afterImageUrl: null,
    treatments: standardTreatments.reduce((acc, treat) => { 
      acc[treat] = false; 
      return acc; 
    }, {} as { [key: string]: boolean })
  })
  const [carDialogOpen, setCarDialogOpen] = useState(false)
  const [newCar, setNewCar] = useState<Partial<Car>>({
    name: '',
    color: '#3699FF',
    make: '',
    model: '',
  })
  const [editMode, setEditMode] = useState(false)

  // --- State for Wash Entry Detail Dialog ---
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEntryForDetail, setSelectedEntryForDetail] = useState<WashEntry | null>(null);

  const selectedCarObject = useMemo(() => cars.find(car => car.id === selectedCar), [cars, selectedCar]);
  const activeTheme = useMemo(() => getThemeForMake(selectedCarObject?.make), [selectedCarObject]);

  useEffect(() => {
    const updatedCars = cars.map(car => {
      if (car.id === '1' && !car.make) {
        return { ...car, make: 'Polestar', model: '2' };
      }
      return car;
    });
    if (JSON.stringify(updatedCars) !== JSON.stringify(cars)) {
      setCars(updatedCars);
    }

    const savedCars = localStorage.getItem('cars')
    if (savedCars) {
      const parsedCars = JSON.parse(savedCars)
      if (parsedCars.length === 0) {
        setCars([{ id: '1', name: 'Polestar 2', make: 'Polestar', model: '2', color: '#E4E6EF' }])
        setSelectedCar('1')
      } else {
        const checkedCars = parsedCars.map((c: Car) => ({
          ...c,
          make: c.make || 'Unknown',
          model: c.model || '',
        }))
        setCars(checkedCars)
        if (!checkedCars.find((c: Car) => c.id === selectedCar) && checkedCars.length > 0) {
          setSelectedCar(checkedCars[0].id)
        } else if (!selectedCar && checkedCars.length > 0) {
          setSelectedCar(checkedCars[0].id)
        }
      }
    } else {
      setCars([{ id: '1', name: 'Polestar 2', make: 'Polestar', model: '2', color: '#E4E6EF' }])
      setSelectedCar('1')
    }
    
    const savedEntries = localStorage.getItem('washEntries')
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries)
      const convertedEntries: { [key: string]: WashEntry[] } = {}
      Object.keys(parsedEntries).forEach(carId => {
        convertedEntries[carId] = parsedEntries[carId].map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }))
      })
      setEntries(convertedEntries)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cars', JSON.stringify(cars))
  }, [cars])

  useEffect(() => {
    localStorage.setItem('washEntries', JSON.stringify(entries))
  }, [entries])

  const handleAddEntry = () => {
    if (!newEntry.date || !newEntry.type || !selectedCar) return

    const entry: WashEntry = {
      id: Date.now().toString(),
      date: new Date(newEntry.date),
      type: newEntry.type as WashEntry['type'],
      notes: newEntry.notes || '',
      beforeImageUrl: newEntry.beforeImageUrl,
      afterImageUrl: newEntry.afterImageUrl,
      treatments: newEntry.treatments
    }

    setEntries(prevEntries => ({
      ...prevEntries,
      [selectedCar]: [entry, ...(prevEntries[selectedCar] || [])],
    }))
    
    setNewEntry({
      date: new Date(),
      type: 'Manual',
      notes: '',
      beforeImageUrl: null,
      afterImageUrl: null,
      treatments: standardTreatments.reduce((acc, treat) => { 
        acc[treat] = false; 
        return acc; 
      }, {} as { [key: string]: boolean })
    })
  }

  const handleDeleteEntry = (carId: string, entryId: string) => {
    setEntries(prevEntries => ({
      ...prevEntries,
      [carId]: prevEntries[carId].filter(entry => entry.id !== entryId),
    }))
  }

  const getDaysSinceLastWash = () => {
    const carEntries = entries[selectedCar]
    if (!carEntries || carEntries.length === 0) return null
    return differenceInDays(new Date(), carEntries[0].date)
  }

  const handleOpenCarDialog = (car?: Car) => {
    if (car) {
      setNewCar({ ...car })
      setEditMode(true)
    } else {
      setNewCar({
        name: '',
        color: carColors[Math.floor(Math.random() * carColors.length)],
        make: '',
        model: '',
      })
      setEditMode(false)
    }
    setCarDialogOpen(true)
  }

  const handlePresetClick = (preset: typeof presetCars[0]) => {
    setNewCar({
      name: preset.name,
      make: preset.make,
      model: preset.model,
      color: preset.color,
      id: newCar.id,
    })
  }

  const handleSaveCar = () => {
    if (!newCar.name || !newCar.make) {
      alert("Car Name and Make are required.");
      return;
    }

    if (editMode && newCar.id) {
      setCars(cars.map(car => car.id === newCar.id ? { ...newCar } as Car : car))
    } else {
      const newCarWithId = {
        id: Date.now().toString(),
        name: newCar.name,
        color: newCar.color || carColors[0],
        make: newCar.make,
        model: newCar.model,
      } as Car

      setCars([...cars, newCarWithId])
      setSelectedCar(newCarWithId.id)
    }
    
    setCarDialogOpen(false)
  }

  const handleDeleteCar = (carId: string) => {
    const remainingCars = cars.filter(car => car.id !== carId)
    setCars(remainingCars)
    
    const newEntries = { ...entries }
    delete newEntries[carId]
    setEntries(newEntries)
    
    if (selectedCar === carId) {
      if (remainingCars.length > 0) {
        setSelectedCar(remainingCars[0].id)
      } else {
        setCars([{ id: '1', name: 'Polestar 2', make: 'Polestar', model: '2', color: '#E4E6EF' }])
        setSelectedCar('1')
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEntry(prev => ({
          ...prev,
          [type === 'before' ? 'beforeImageUrl' : 'afterImageUrl']: reader.result as string
        }));
      }
      reader.readAsDataURL(file);
    }
  };

  const handleTreatmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setNewEntry(prev => ({
      ...prev,
      treatments: {
        ...(prev.treatments || {}),
        [name]: checked
      }
    }));
  };

  // --- Handlers for Detail Dialog ---
  const handleOpenDetailDialog = (entry: WashEntry) => {
    setSelectedEntryForDetail(entry);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedEntryForDetail(null); // Clear selection on close
  };

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        {selectedCarObject && (
          <Box
            sx={(theme) => ({
              position: 'relative',
              height: { xs: 280, sm: 380 },
              background: `linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, ${theme.palette.background.default} 90%)`,
              overflow: 'visible',
              mb: 4,
              textAlign: 'center',
            })}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                position: 'relative',
                pt: 3,
                color: 'text.primary',
                fontWeight: '600',
                zIndex: 2,
                textAlign: 'center'
              }}
            >
              {selectedCarObject.make || ''} {selectedCarObject.model || ''}
            </Typography>
            
            <Box sx={{ 
              position: 'absolute', 
              bottom: -20,
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: '90%', 
              maxWidth: '500px',
              zIndex: 1,
            }}>
              <img
                src={getImageForMake(selectedCarObject.make)}
                alt={`${selectedCarObject.make || ''} ${selectedCarObject.model || ''}`}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.3))',
                  transform: selectedCarObject.make?.toLowerCase().includes('mercedes') || selectedCarObject.make?.toLowerCase().includes('bmw') 
                              ? 'scale(0.9)' 
                              : 'none',
                  transition: 'transform 0.3s ease-in-out'
                }}
              />
            </Box>
          </Box>
        )}

        <Container maxWidth="md" sx={{ pb: 4 }}>
          <Stack 
            spacing={3}
            sx={{ alignItems: 'center' }} 
           >
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, width: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsCarIcon /> My Cars
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {cars.map(car => (
                  <Grid item xs={12} sm={6} md={4} key={car.id}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        bgcolor: selectedCar === car.id ? 'action.hover' : 'background.default',
                        border: '1px solid',
                        borderColor: selectedCar === car.id ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 1,
                          borderColor: 'primary.light',
                        },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={() => setSelectedCar(car.id)}
                    >
                      <CardContent sx={{ p: 2, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: car.color, 
                              color: theme => 
                                car.color === '#F3F6F9' || car.color === '#E4E6EF' ? 'text.primary' : '#fff',
                              width: 32, 
                              height: 32 
                            }}
                          >
                            <DirectionsCarIcon fontSize="small"/>
                          </Avatar>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {car.name}
                          </Typography>
                        </Box>
                        {(car.make || car.model) && (
                          <Typography variant="body2" color="text.secondary">
                            {car.make} {car.model}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions sx={{ p: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit Car">
                          <IconButton 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); handleOpenCarDialog(car); }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {cars.length > 1 && (
                          <Tooltip title="Delete Car">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={(e) => { e.stopPropagation(); handleDeleteCar(car.id); }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}

                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      minHeight: 130,
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => handleOpenCarDialog()}
                  >
                    <CardContent>
                      <Box sx={{ textAlign: 'center' }}>
                        <AddIcon color="primary" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Add New Car
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {selectedCarObject && (
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, width: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventNote /> Add New Wash Entry for {selectedCarObject.name}
                </Typography>
                
                {/* Row 1: Date, Type, Notes */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2, mb: 3 }}>
                  <TextField
                    type="date"
                    label="Date"
                    value={newEntry.date ? format(new Date(newEntry.date), 'yyyy-MM-dd') : ''}
                    onChange={(e) => setNewEntry({ ...newEntry, date: new Date(e.target.value) })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Wash Type</InputLabel>
                    <Select
                      value={newEntry.type}
                      label="Wash Type"
                      onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as WashEntry['type'] })}
                    >
                      <MenuItem value="Manual">Manual</MenuItem>
                      <MenuItem value="Drive-thru">Drive-thru</MenuItem>
                      <MenuItem value="Detail">Detail</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Notes (Optional)"
                    value={newEntry.notes || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    fullWidth
                  />
                </Stack>

                {/* Row 2: Image Uploads */}
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Upload Images (Optional)</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button variant="outlined" component="label" size="small">
                      Before Image
                      <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'before')} />
                    </Button>
                    {newEntry.beforeImageUrl && (
                      <Avatar 
                        src={newEntry.beforeImageUrl} 
                        variant="rounded" 
                        sx={{ width: 40, height: 40 }} 
                      />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button variant="outlined" component="label" size="small">
                      After Image
                      <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'after')} />
                    </Button>
                    {newEntry.afterImageUrl && (
                      <Avatar 
                        src={newEntry.afterImageUrl} 
                        variant="rounded" 
                        sx={{ width: 40, height: 40 }} 
                      />
                    )}
                  </Box>
                </Stack>

                {/* Row 3: Treatments Checkboxes */}
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Treatments Applied (Optional)</Typography>
                <FormGroup sx={{ mb: 3 }}>
                  <Grid container spacing={1}>
                    {standardTreatments.map((treatment) => (
                      <Grid item xs={12} sm={6} md={4} key={treatment}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={newEntry.treatments?.[treatment] || false} 
                              onChange={handleTreatmentChange} 
                              name={treatment} 
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">{treatment}</Typography>}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>

                {/* Submit Button */}
                <Box sx={{ textAlign: 'right' }}> {/* Align button to the right */} 
                  <Button 
                    variant="contained" 
                    onClick={handleAddEntry}
                    sx={{ 
                      // minWidth: '120px', // Remove minWidth for standard size
                      // height: '56px', // Remove fixed height
                    }}
                    disabled={!selectedCar}
                  >
                    Add Wash Entry
                  </Button>
                </Box>
              </Paper>
            )}

            {selectedCarObject && (
              <Box sx={{ width: '100%' }}> {/* Let Box take width, Grid inside handles columns */} 
                <Grid container spacing={3} /* Removed justifyContent */>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timer /> Wash Status
                      </Typography>
                      {getDaysSinceLastWash() !== null ? (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Typography variant="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            {getDaysSinceLastWash()}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            day{getDaysSinceLastWash() !== 1 ? 's' : ''} since last wash
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                          No wash entries yet.
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalCarWash /> Wash History
                      </Typography>
                      {entries[selectedCar] && entries[selectedCar].length > 0 ? (
                        <List sx={{ maxHeight: 300, overflowY: 'auto', mt: 1, pr: 1 }}>
                          {entries[selectedCar].map((entry, index) => {
                            return (
                              <React.Fragment key={entry.id}>
                                <ListItem
                                  button 
                                  onClick={() => handleOpenDetailDialog(entry)}
                                  disablePadding
                                  sx={{
                                    bgcolor: index === 0 ? 'action.hover' : 'transparent',
                                    borderRadius: 1, 
                                    p: 1.5, 
                                    alignItems: 'center' // Align items vertically center
                                  }}
                                >
                                  {/* Add Before Image Thumbnail Preview */}
                                  {entry.beforeImageUrl && (
                                    <Avatar 
                                      src={entry.beforeImageUrl} 
                                      variant="rounded" 
                                      sx={{ width: 40, height: 40, mr: 1.5 }} // Add margin right
                                    />
                                  )}

                                  {/* Main Content */}
                                  <ListItemText
                                    primary={
                                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                        {format(new Date(entry.date), 'MMMM d, yyyy')}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                          label={entry.type}
                                          size="small"
                                          sx={{
                                            bgcolor: getChipColor(entry.type),
                                            color: '#fff',
                                            fontWeight: 500,
                                            height: 'auto',
                                            fontSize: '0.75rem'
                                          }}
                                        />
                                        {entry.notes && (
                                          <Typography
                                            component="span"
                                            variant="caption"
                                            color="text.secondary"
                                            noWrap
                                            sx={{ flexGrow: 1, ml: 1, fontStyle: 'italic' }}
                                          >
                                            {entry.notes}
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      edge="end"
                                      aria-label="delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEntry(selectedCar, entry.id);
                                      }}
                                      sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                                      size="small"
                                    >
                                      <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                                {index < entries[selectedCar].length - 1 && <Divider sx={{ my: 1 }} />}
                              </React.Fragment>
                            )
                          })}
                        </List>
                      ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                          No wash history available.
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Stack>
        </Container>

        <Dialog open={carDialogOpen} onClose={() => setCarDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Car' : 'Add New Car'}</DialogTitle>
          <DialogContent>
            {!editMode && (
              <Box sx={{ mb: 3, pt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Or choose a preset:
                </Typography>
                <Grid container spacing={1}>
                  {presetCars.map((preset) => (
                    <Grid item xs={6} sm={3} key={preset.make}>
                      <Button 
                        fullWidth 
                        variant="outlined"
                        size="small"
                        startIcon={<Avatar sx={{ bgcolor: preset.color, width: 20, height: 20 }}><DirectionsCarIcon sx={{ fontSize: 12 }} /></Avatar>}
                        onClick={() => handlePresetClick(preset)}
                        sx={{ 
                           justifyContent: 'flex-start',
                           textTransform: 'none',
                           fontSize: '0.8rem',
                           borderColor: 'divider',
                           color: 'text.secondary',
                           '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'action.hover'
                           }
                        }}
                      >
                        {preset.make}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

            <Stack spacing={2}>
              <TextField 
                 label={editMode ? "Car Name" : "Car Name *"}
                 fullWidth 
                 value={newCar.name || ''} 
                 onChange={(e) => setNewCar({ ...newCar, name: e.target.value })} 
                 placeholder="e.g. My Polestar, Family SUV" 
              />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Display Color
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {carColors.map(color => (
                    <Tooltip title={color} key={color}>
                      <Avatar 
                        sx={{ 
                          bgcolor: color, 
                          width: 28,
                          height: 28, 
                          cursor: 'pointer',
                          border: newCar.color === color ? '2px solid' : '1px solid transparent',
                          borderColor: 'primary.main',
                          transition: 'border 0.2s'
                        }}
                        onClick={() => setNewCar({ ...newCar, color })}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
              <TextField 
                label={editMode ? "Make" : "Make *"}
                fullWidth 
                value={newCar.make || ''} 
                onChange={(e) => setNewCar({ ...newCar, make: e.target.value })} 
                placeholder="e.g. Polestar, BMW, Tesla" 
              />
              <TextField 
                label="Model (Optional)" 
                fullWidth 
                value={newCar.model || ''} 
                onChange={(e) => setNewCar({ ...newCar, model: e.target.value })} 
                placeholder="e.g. 2, M4, Model 3" 
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCarDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveCar} 
              variant="contained" 
              disabled={!newCar.name || !newCar.make} 
            >
              {editMode ? 'Update' : 'Add'} Car
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- Wash Entry Detail Dialog --- */}
        <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
          {selectedEntryForDetail && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Wash Details - {format(new Date(selectedEntryForDetail.date), 'MMMM d, yyyy')}
                <Chip label={selectedEntryForDetail.type} size="small" sx={{ bgcolor: getChipColor(selectedEntryForDetail.type), color: '#fff' }}/>
              </DialogTitle>
              <DialogContent dividers>
                <Stack spacing={3}>
                  {/* Images Section */}
                  {(selectedEntryForDetail.beforeImageUrl || selectedEntryForDetail.afterImageUrl) && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Images</Typography>
                      <Grid container spacing={2}>
                        {selectedEntryForDetail.beforeImageUrl && (
                          <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" display="block" color="text.secondary">Before</Typography>
                            <img src={selectedEntryForDetail.beforeImageUrl} alt="Before Wash" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} />
                          </Grid>
                        )}
                        {selectedEntryForDetail.afterImageUrl && (
                          <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" display="block" color="text.secondary">After</Typography>
                            <img src={selectedEntryForDetail.afterImageUrl} alt="After Wash" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} />
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  {/* Treatments Section */}
                  {selectedEntryForDetail.treatments && Object.values(selectedEntryForDetail.treatments).some(v => v) && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Treatments Applied</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Object.entries(selectedEntryForDetail.treatments)
                          .filter(([, value]) => value)
                          .map(([key]) => (
                            <Chip key={key} label={key} />
                          ))
                        }
                      </Box>
                    </Box>
                  )}

                  {/* Notes Section */}
                  {selectedEntryForDetail.notes && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Notes</Typography>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedEntryForDetail.notes}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDetailDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}

export default App 