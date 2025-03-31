import React, { useState, useEffect } from 'react'
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
}

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

function App() {
  const [cars, setCars] = useState<Car[]>([{ id: '1', name: 'Polestar 2', make: 'Polestar', model: '2', color: '#E4E6EF' }])
  const [selectedCar, setSelectedCar] = useState<string>('1')
  const [entries, setEntries] = useState<{ [key: string]: WashEntry[] }>({})
  const [newEntry, setNewEntry] = useState<Partial<WashEntry>>({
    date: new Date(),
    type: 'Manual',
    notes: '',
  })
  const [carDialogOpen, setCarDialogOpen] = useState(false)
  const [newCar, setNewCar] = useState<Partial<Car>>({
    name: '',
    color: '#3699FF',
    make: '',
    model: '',
  })
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const savedCars = localStorage.getItem('cars')
    if (savedCars) {
      const parsedCars = JSON.parse(savedCars)
      if (parsedCars.length === 0) {
        setCars([{ id: '1', name: 'Polestar 2', make: 'Polestar', model: '2', color: '#E4E6EF' }])
        setSelectedCar('1')
      } else {
        setCars(parsedCars)
        if (!parsedCars.find((c: Car) => c.id === selectedCar) && parsedCars.length > 0) {
          setSelectedCar(parsedCars[0].id)
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
    }

    setEntries(prevEntries => ({
      ...prevEntries,
      [selectedCar]: [entry, ...(prevEntries[selectedCar] || [])],
    }))
    setNewEntry({
      date: new Date(),
      type: 'Manual',
      notes: '',
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

  const handleSaveCar = () => {
    if (!newCar.name) return

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

  const selectedCarObject = cars.find(car => car.id === selectedCar)

  return (
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
              src="/PolestarimageCarRepresentation.png"
              alt={`${selectedCarObject.make || ''} ${selectedCarObject.model || ''}`}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.3))'
              }}
            />
          </Box>
        </Box>
      )}

      <Container maxWidth="md" sx={{ pb: 4 }}>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
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
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventNote /> Add New Wash Entry for {selectedCarObject.name}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
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
                <Button 
                  variant="contained" 
                  onClick={handleAddEntry}
                  sx={{ 
                    minWidth: '120px',
                    height: '56px',
                  }}
                  disabled={!selectedCar}
                >
                  Add Entry
                </Button>
              </Stack>
            </Paper>
          )}

          {selectedCarObject && (
            <Grid container spacing={3}>
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
                      {entries[selectedCar].map((entry, index) => (
                        <React.Fragment key={entry.id}>
                          <ListItem
                            disablePadding
                            sx={{
                              bgcolor: index === 0 ? 'action.hover' : 'transparent',
                              borderRadius: 1, 
                              p: 1.5,
                            }}
                          >
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
                                      sx={{ 
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1, 
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}
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
                                onClick={() => handleDeleteEntry(selectedCar, entry.id)}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                                size="small"
                              >
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < entries[selectedCar].length - 1 && <Divider sx={{ my: 1 }} />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                      No wash history available.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Stack>
      </Container>

      <Dialog open={carDialogOpen} onClose={() => setCarDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Car' : 'Add New Car'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Car Name *"
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
              label="Make (Optional)"
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
              placeholder="e.g. 2, 3 Series, Model Y"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCarDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveCar} 
            variant="contained" 
            disabled={!newCar.name}
          >
            {editMode ? 'Update' : 'Add'} Car
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default App 