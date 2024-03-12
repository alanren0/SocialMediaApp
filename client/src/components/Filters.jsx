import { useEffect, useState } from "react"
import { useRecoilState } from "recoil";
import { reverseState, sortByState, dateLimitState } from '../state';


function Filters({ }) {
    const [reverse, setReverse] = useRecoilState(reverseState);
    const [sortBy, setSortBy] = useRecoilState(sortByState);
    const [dateLimit, setDateLimit] = useRecoilState(dateLimitState);


    return (
        <div className='filters-container'>
            <div style={{flex: 6}}></div>
            <button onClick={() => {setReverse(!reverse)}} className='filter-option'>
                Order
            </button>

            {/* sort options */}
            <select onChange={ e => setSortBy(e.target.value) } className='filter-option'>
                <option value='date_posted'>Date Posted</option>
                <option value='views'>Views</option>
                <option value='likes'>Likes</option>
            </select>

            {/* date options */}
            <select onChange={ e => setDateLimit(e.target.value) } className='filter-option'>
                <option value='all'>All Time</option>
                <option value='24h'>24 Hours</option>
                <option value='72h'>3 Days</option>
                <option value='168h'>1 Week</option>
            </select>
        </div>
    )
}

export default Filters