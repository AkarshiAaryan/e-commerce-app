import React, { useState } from 'react'
import { assets } from '../assets/frontend_assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const { cartCount } = useShop()

  const navItemClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 text-sm ${isActive ? 'text-black' : 'text-gray-700'}`

  return (
    <header className="relative flex items-center justify-between py-5 font-medium">
      <Link to="/" className="flex items-center gap-3">
        <img src={assets.logo} className="w-36" alt="Store logo" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <li>
          <NavLink to="/" className={navItemClass}>
            <p>HOME</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden sm:block" />
          </NavLink>
        </li>
        <li>
          <NavLink to="/collection" className={navItemClass}>
            <p>COLLECTION</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden sm:block" />
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={navItemClass}>
            <p>ABOUT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden sm:block" />
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={navItemClass}>
            <p>CONTACT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden sm:block" />
          </NavLink>
        </li>
      </ul>

      <div className="flex items-center gap-6">
        <img src={assets.search_icon} className="w-5 cursor-pointer" alt="Search" />

        <div className="group relative">
          <img src={assets.profile_icon} className="w-5 cursor-pointer" alt="Profile" />
          <div className="group-hover:block hidden absolute right-0 top-full pt-4">
            <div className="flex flex-col gap-2 w-40 py-3 px-4 bg-slate-100 text-gray-500 rounded shadow-md">
              <Link to="/profile" className="cursor-pointer hover:text-black">My Profile</Link>
              <Link to="/orders" className="cursor-pointer hover:text-black">Orders</Link>
              <button className="text-left cursor-pointer hover:text-black">Logout</button>
            </div>
          </div>
        </div>

        <Link className="relative" to="/cart">
          <img src={assets.cart_icon} className="w-5 min-w-[20px]" alt="Cart" />
          <span className="absolute -right-1 -bottom-1 w-4 h-4 text-[8px] leading-4 bg-black text-white rounded-full text-center">
            {cartCount || 0}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setVisible(true)}
          className="sm:hidden p-2 rounded-md bg-slate-100 hover:bg-slate-200"
          aria-label="Open menu"
        >
          <img src={assets.menu_icon} className="w-5 h-5" alt="Menu" />
        </button>
      </div>

      <div className={`absolute top-0 right-0 bottom-0 z-50 overflow-hidden bg-white transition-all duration-300 ${visible ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <button onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 text-left cursor-pointer'>
            <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="Back" />
            <p className='font-medium'>Back</p>
          </button>
          <NavLink onClick={() => setVisible(false)} className='py-4 px-6 border-b border-gray-200 text-sm font-medium' to='/'>HOME</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-4 px-6 border-b border-gray-200 text-sm font-medium' to='/collection'>COLLECTION</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-4 px-6 border-b border-gray-200 text-sm font-medium' to='/about'>ABOUT</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-4 px-6 border-b border-gray-200 text-sm font-medium' to='/contact'>CONTACT</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-4 px-6 border-b border-gray-200 text-sm font-medium' to='/cart'>CART</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-4 px-6 border-b border-gray-200 text-sm font-medium' to='/profile'>PROFILE</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-4 px-6 border-b border-gray-200 text-sm font-medium' to='/orders'>ORDERS</NavLink>
          <button onClick={() => setVisible(false)} className='py-4 px-6 text-left text-sm font-medium text-gray-700 hover:bg-slate-100'>LOGOUT</button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
