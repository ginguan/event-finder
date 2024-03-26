import React, { useEffect, useState } from 'react'
import { MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Tooltip, IconButton, Collapse, Box, Typography, Button, TablePagination } from '@mui/material'
import { DatePicker } from 'antd'
import type { Dayjs } from 'dayjs'
import CountryCode from '../CountryCode.json'
import EventData from '../EventExample.json'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import InfoIcon from '@mui/icons-material/Info'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { getEvents } from '../api/EventApi'
import LabelColor from '../LabelColor.json'
import { stringify } from 'querystring'

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
    const [openId, setOpenId] = useState<string>('')
    const [submitDate, setSubmitDate] = useState<string[]>([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [totalCount, setTotalCount] = useState(0)
    const labelColor = LabelColor as {[key: string]: string}
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const [allEvents, setAllEvents] = useState([]);

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
    console.log(events)
    useEffect(() => {
        if (selectedDate && selectedDate[0] && selectedDate[1]) {
            const formattedStartDate = selectedDate[0].format('YYYY-MM-DD')
            const formattedEndDate = selectedDate[1].format('YYYY-MM-DD')
            setSubmitDate([formattedStartDate, formattedEndDate])
        }
    }, [selectedDate])
    useEffect(() => {
        const fetchEvents = async () => {
          const { events } = await getEvents(selectedCountry, submitDate, longitude, latitude);
          const start = page * rowsPerPage;
          const end = start + rowsPerPage;
          setEvents(events.slice(start, end));
        };
      
        fetchEvents();
      }, [page, rowsPerPage]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
        const start = newPage * rowsPerPage;
        const end = start + rowsPerPage;
        setEvents(allEvents.slice(start, end));
      };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    // useEffect(() => {
    //     getEvents(selectedCountry, submitDate, longitude, latitude).then(data => {
    //         setEvents(data.events)
    //         setIsLoading(false)
    //         setTotalCount(data.totalCount)
    //     })
    // }, [selectedCountry, submitDate, longitude, latitude])

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

        const data = await getEvents(undefined, undefined, undefined, undefined)

        setEvents(data.events) // Update the type of events state variable
        setTotalCount(data.totalCount)
        setIsLoading(false)
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    const handleCountryChange = (value: string) => {
        setSelectedCountry(value)
    }

    const countryDropdown = () => (
        <div>
            <span style={{ margin: '15px' }}>Country: </span>
            <Select

                value={selectedCountry}
                onChange={(event) => handleCountryChange(event.target.value as string)}
                style={{ width: 220, margin: '5px', }}
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
        const response = await getEvents(selectedCountry, submitDate, longitude, latitude)
        const { events, totalCount } = response
        setEvents(events)
        setTotalCount(totalCount)
        setIsLoading(false)
        setPage(0)
    }

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
        setOpenId(openId === id ? '' : id)
    }
    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                margin: '5%'
            }}>
                {countryDropdown()}
                {getToolTip('If Country and Coordinates are selected, the events will be filtered based on the selected Coordinates')}
                <span style={{ margin: '18px' }}>Date Range: </span>
                <RangePicker
                    style={{ margin: '5px', width: 400, height: 55, }}
                    id={{
                        start: 'startInput',
                        end: 'endInput',
                    }}
                    format="YYYY-MM-DD"
                    defaultValue={[dayjs(formattedDate), dayjs(formattedDate7daysAfter)]}
                    onChange={setSelectedDate}
                />

                {/* </div>
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                margin: '10px'
            }}> */}
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
            <div style={{ marginLeft: '5%', marginRight: '5%' }}>
                <h1>Event Finder</h1>
                {events && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell />
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
                                            {/* <TableCell>{event.labels.join(', ')}</TableCell> */}
                                            <TableCell>
                                                {event.labels.map((label, index) => (
                                                    <span key={index} style={{ color: labelColor[label] || 'black' }}>
                                                        {label}
                                                        {index < event.labels.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </TableCell>
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
                                                                <Typography>{event.description}</Typography>
                                                            </div>

                                                            {latitude && longitude &&
                                                                <div id="google-maps-display" style={{ height: '100%', width: '100%', maxWidth: '100%' }}>
                                                                    <Typography variant="h6" gutterBottom component="div" style={{ marginTop: '5px' }}>
                                                                        Location
                                                                    </Typography>
                                                                    <iframe src={`https://maps.google.com/maps?q=${longitude},${latitude}&ampt=&ampz=3&ampie=UTF8&ampiwloc=&amp&output=embed`} width='1000' height='250px' allowFullScreen></iframe>
                                                                </div>}
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow ></>
                                    )
                                })}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>

                )}
            </div>
        </div >
    )
}

export default EventContainer