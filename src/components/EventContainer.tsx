import React, { useEffect, useState } from 'react'
import { MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Tooltip, IconButton, Collapse, Box, Typography, Button } from '@mui/material'
import { DatePicker } from 'antd'
import type { Dayjs } from 'dayjs'
import CountryCode from '../CountryCode.json'
import EventData from '../EventExample.json'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

type Order = 'asc' | 'desc'

dayjs.extend(customParseFormat)

const { RangePicker } = DatePicker

type RangeValue = [Dayjs | null, Dayjs | null] | null

const EventContainer: React.FC = () => {

    const [events, setEvents] = useState([])
    const [selectedCountry, setSelectedCountry] = useState('' as string)
    const [isLoading, setIsLoading] = useState(true)
    const [order, setOrder] = useState<Order>('asc')
    const [orderBy, setOrderBy] = useState<keyof typeof EventData[0]>('title')
    const [selectedDate, setSelectedDate] = useState<RangeValue>([dayjs(), dayjs()] as RangeValue)
    const [longitude, setLongitude] = useState('')
    const [latitude, setLatitude] = useState('')
    const [openId, setOpenId] = useState<string>('');
    const [submitDate, setSubmitDate] = useState<string[]>([])

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    const formattedDate = `${year}-${month}-${day}`

    now.setDate(now.getDate() + 7)

    const yearAfter7Days = now.getFullYear()
    const monthAfter7Days = String(now.getMonth() + 1).padStart(2, '0')
    const dayAfter7Days = String(now.getDate()).padStart(2, '0')

    const formattedDate7daysAfter = `${yearAfter7Days}-${monthAfter7Days}-${dayAfter7Days}`

    useEffect(() => {
        fetchEvents()
        setSubmitDate([formattedDate, formattedDate7daysAfter])
    }, [])

    useEffect(() => {
        // ?active.gte=2015-01-01&active.lte=2015-03-01
        if (selectedDate && selectedDate[0] && selectedDate[1]) {
            const formattedStartDate = selectedDate[0].format('YYYY-MM-DD')
            const formattedEndDate = selectedDate[1].format('YYYY-MM-DD')
            console.log('formattedDate', formattedStartDate, formattedEndDate)
            setSubmitDate([formattedStartDate, formattedEndDate])
        }
    }, [selectedDate])

    const handleRequestSort = (property: keyof typeof EventData[0]) => {
        const isAsc = orderBy === property && order === 'asc'
        const newOrder = isAsc ? 'desc' : 'asc'
        setOrder(newOrder)
        setOrderBy(property)

        setEvents((events) =>
            [...events].sort((a, b) => {
                if (newOrder === 'asc') {
                    return a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0
                } else {
                    return a[orderBy] > b[orderBy] ? -1 : a[orderBy] < b[orderBy] ? 1 : 0
                }
            })
        )
    }

    const fetchEvents = async () => {
        // Fetch your events here

        const response = await fetch('http://localhost:3001/events') 
        const data = await response.json()
        setEvents(data)
        setIsLoading(false)
    }

    if (isLoading) {
        return <div>Loading...</div>
    }


    const handleCountryChange = (value: string) => {
        // Handle country change here
        console.log('handleCountryChange', value)
        setSelectedCountry(value)
    }

    const countryDropdown = () => (
        <div>
            <span style={{ margin: '15px' }}>Country: </span>
            <Select
                value={selectedCountry}
                onChange={(event) => handleCountryChange(event.target.value as string)}
                style={{ width: 220 }}
            >
                {CountryCode.map((item: any) => (
                    <MenuItem key={item.label} value={item.value}>
                        {item.label}
                    </MenuItem>
                ))}
            </Select>
        </div>
    )

    const handleFilterClick = async () => {
        console.log(selectedCountry, submitDate, longitude, latitude);
        let url = 'http://localhost:3001/events?limit=100&page=1'
        if(latitude && longitude){
            url += `&origin=${latitude},${longitude}`
        }
        if(!latitude && !longitude && selectedCountry){ 
            url += `&country=${selectedCountry}`
        }
        if(submitDate){
            url += `&active.gte=${submitDate[0]}&active.lte=${submitDate[1]}`
        }
        const response = await fetch(url) 
        const data = await response.json()
        setEvents(data)
        setIsLoading(false)
      };
    
    const getToolTip = (message: string) => {
        return (
        <Tooltip title={message} style={{ marginTop: '8px' }}>
            <IconButton>
                <InfoIcon />
            </IconButton>
        </Tooltip>
        )
    }
    const handleOpen = (id: string) => {
        setOpenId(openId === id ? '' : id);
    };
    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                margin: '10px'
            }}>
                {countryDropdown()}
                {getToolTip('If Country and Coordinates are selected, the events will be filtered based on the selected Coordinates')}
                <span style={{ margin: '18px' }}>Date Range: </span>
                <RangePicker
                    style={{ width: 400, height: 55, }}
                    id={{
                        start: 'startInput',
                        end: 'endInput',
                    }}
                    format="YYYY-MM-DD"
                    defaultValue={[dayjs(formattedDate), dayjs(formattedDate7daysAfter)]}
                    onChange={setSelectedDate}
                />

            </div>
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                margin: '10px'
            }}>
                <span style={{ margin: '18px' }}>Coordinates: </span>
                <TextField
                    style={{ margin: '5px' }}
                    id="latitude"
                    label="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                />
                <TextField
                    style={{ margin: '5px' }}
                    id="longitude"
                    label="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                />
               
                <Button style={{ margin: '15px' }} variant="contained" onClick={handleFilterClick}>Filter</Button>
    
            </div>
            <div style={{ margin: '5%' }}>
                {events && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                <TableCell/>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'title'}
                                            direction={orderBy === 'title' ? order : 'asc'}
                                            onClick={() => handleRequestSort('title')}
                                        >
                                            Event
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'start'}
                                            direction={orderBy === 'start' ? order : 'asc'}
                                            onClick={() => handleRequestSort('start')}
                                        >
                                            Start Date
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'end'}
                                            direction={orderBy === 'end' ? order : 'asc'}
                                            onClick={() => handleRequestSort('end')}
                                        >
                                            End Date
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel>
                                            Labels
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel>
                                            State
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {events.map((event: { id: string, title: string, start: string, end: string, labels: string[], state: string, geo: any, description: string }) => {
                                    const latitude = event.geo.geometry.coordinates[0]
                                    const longitude = event.geo.geometry.coordinates[1]
                                    console.log(event.id,'latitude', latitude, 'longitude', longitude)
                                    return (
                                        <><TableRow key={event.id}>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => handleOpen(event.id)}>
                                                    {openId === event.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{event.title}</TableCell>
                                            <TableCell>{dayjs(event.start).format('YYYY-MM-DD hh:mm A')}</TableCell>
                                            <TableCell>{dayjs(event.end).format('YYYY-MM-DD hh:mm A')}</TableCell>
                                            <TableCell>{event.labels.join(', ')}</TableCell>
                                            <TableCell>
                                                <span style={{ color: event.state === 'active' ? 'green' : 'red' }}>{event.state.toUpperCase()}</span>
                                            </TableCell>
                                        </TableRow><TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                    <Collapse in={openId === event.id} timeout="auto" unmountOnExit>
                                                        <Box margin={1}>
                                                            <div>
                                                                <Typography variant="h6" gutterBottom component="div">
                                                                    Description
                                                                </Typography>
                                                                <Typography>{event.description}</Typography></div>
                                                            <Typography variant="h6" gutterBottom component="div" style={{marginTop:'5px'}}>
                                                                Location
                                                            </Typography>
                                                            <div id="google-maps-display" style={{ height: '100%', width: '100%', maxWidth: '100%' }}>
                                                                <iframe src={`https://maps.google.com/maps?q=${longitude},${latitude}&amp;t=&amp;z=3&amp;ie=UTF8&amp;iwloc=&amp;&output=embed`} width='1000' height='250px' allowFullScreen></iframe>
                                                            </div>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow ></>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                )}
            </div>
        </div >
    )
}

export default EventContainer