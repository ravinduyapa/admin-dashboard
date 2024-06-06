import React from 'react'
import { IoSearch } from 'react-icons/io5'
import { IoIosArrowDown } from 'react-icons/io'
import client from '../assets/assets/images/client.jpg'

const Header = () => {
  return (
    <section className='w-full bg-slate-100 lg:h-20 h-fit flex lg:flex-row flex-col justify-between items-center p-4 rounded-xl lg:gap-2 gap-4'>

      <div>
        <h1 className='text-2xl font-semibold'>Overview</h1>
      </div>

      <div className='flex justify-between items-center gap-10'>
        <IoSearch className='w-6 h-6 cursor-pointer hover:scale-150 hover:text-yellow-500 transition-all'/>
        <div id='client-info' className='flex justify-center items-center gap-4'>
          <img src={client} alt="" className='rounded-full w-12 h-12' />
          <div className='flex flex-col justify-center items-start'>
            <div className='flex justify-center items-center -mb-1 gap-2'>
              <h1 className='text-lg font-semibold'>Hi,Jack</h1><IoIosArrowDown className='cursor-pointer'/>
            </div>
            <p>Admin</p>
          </div>
        </div>
      </div>

    </section>
  )
}

export default Header