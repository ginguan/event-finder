import axios from 'axios'

export async function getEvents( selectedCountry='', submitDate = [] as string[], longitude='', latitude='') {
    try {
        let url = `http://localhost:3001/events?`

        if(latitude && longitude){
            url += `&origin=${latitude},${longitude}`
        }
        if(!latitude && !longitude && selectedCountry){ 
            url += `&country=${selectedCountry}`
        }
        if(submitDate && submitDate.length === 2){
            url += `&active.gte=${submitDate[0]}&active.lte=${submitDate[1]}`
        }
        const response = await axios.get(url)

        const totalCount = response.data.totalCount
        const events = response.data.events
        return {
            events,
            totalCount
        }
    } catch (error) {
        console.error(error)
        throw error
    }
}