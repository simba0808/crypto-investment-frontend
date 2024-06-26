import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaWallet } from 'react-icons/fa'
import { SiLevelsdotfyi } from 'react-icons/si'
import { AiFillSetting } from 'react-icons/ai'
import { TbBinaryTree } from 'react-icons/tb'
import { BiLogoTelegram } from 'react-icons/bi'
import { BiLogOut } from 'react-icons/bi'
import { useSelector, useDispatch } from 'react-redux'

import HamburgerButton from './HamburgerMenuButton/HamburgerButton'
import Avatar from '../../assets/avatar12.png'

import { useLogoutMutation } from '../../slices/usersApiSlice';
import { logout } from '../../slices/authSlice';
import Axios from '../../config/Axios'
const Sidebar = () => {

  const [mobileMenu, setMobileMenu] = useState(false);
  const [avatar, setAvatar] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [logoutApiCall] = useLogoutMutation();
  const logoutHandler = async () => {
    try {
      const res = await logoutApiCall().unwrap();
      navigate('/');
      dispatch(logout());
      console.log(res.message);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchAvatar = async () => {
      const response = await Axios.get(`/api/users/avatar/${userInfo.avatar}`);
      setAvatar(response.data);
    }
    if(userInfo.avatar != '') {
      fetchAvatar();
    }
  }, [userInfo.avatar])

  const Menus = [
    { title: 'Network', path: '/dashboard', src: <TbBinaryTree /> },
    { title: 'Cycle', path: '/cycle', src: <SiLevelsdotfyi /> },
    { title: 'Wallet', path: '/wallet', src: <FaWallet /> },
    { title: 'Profile', path: '/profile', src: <AiFillSetting /> },
  ]

  const help = () => {
    window.open("https://t.me/Cloudwinnerscol", "_blank");
  }


  return (
    <>
      <div className=' w-72 hidden sm:block duration-300 bg-gray-100 p-5 dark:bg-slate-900 h-screen' >
  
        <div >
          <div className="flex flex-col items-center">

            <div className="relative my-4">
                <div className="absolute -inset-2">
                    <div
                        className="w-28 h-full rounded-full max-w-sm mx-auto lg:mx-0 opacity-70 blur-lg bg-gradient-to-r from-yellow-400 via-pink-500 to-red-600">
                    </div>
                </div>
                {avatar?<img  src={`data: image/jpeg;base64, ${avatar}`}  className="relative w-28 h-28 ml-auto mr-auto rounded-full opacity-95 hover:cursor-pointer hover:scale-110 z-10" alt="Avatar"/>:<img  src={Avatar}  className="relative w-28 h-28 ml-auto mr-auto rounded-full opacity-95 hover:cursor-pointer hover:scale-110 z-10" alt="Avatar"/>}
                {/* <img  src={Avatar}  className="relative w-28 ml-auto mr-auto rounded-full shadow-sm shadow-pink-800" alt="Avatar"/> */}

            </div>

            <p className="text-2xl font-bold text-white">
                {userInfo.username}
            </p>

            <div className="text-gray-400 font-serif">
                {userInfo.email}
            </div>
            <div className="text-cyan-400 font-mono mt-2 ">
                <span className='text-gray-400 font-bold'>Balance </span>${userInfo.balance} <span className='text-slate-400 font-mono'>USD</span>
            </div>

          </div>
        </div>


        <ul className='pt-6'>
          {Menus.map((menu, index) => (
            <Link to={menu.path} key={index}>
              <li
                className={`flex items-center gap-x-6 p-3 text-base font-normal rounded-lg cursor-pointer dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700
                        ${menu.gap ? 'mt-9' : 'mt-2'} ${
                  location.pathname === menu.path &&
                  'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className='text-2xl'>{menu.src}</span>
                <span
                  className='origin-left duration-300 hover:block'
                >
                  {menu.title}
                </span>
              </li>
            </Link>
          ))}
            <li
              className="flex items-center gap-x-6 p-3 text-base font-normal rounded-lg cursor-pointer text-white hover:bg-gray-700"
              onClick={help}
            >
              <span className='text-2xl'><BiLogoTelegram /></span>
              <span
                className='origin-left duration-300 hover:block'
              >
                Help
              </span>
            </li>

            <li
              className="flex items-center gap-x-6 p-3 mt-8 text-cyan-400 text-base font-normal rounded-lg cursor-pointer text-white hover:bg-gray-700"
              onClick={logoutHandler}
            >
              <span className='text-2xl'><BiLogOut /></span>
              <span
                className='origin-left duration-300 hover:block'
              >
                Sign Out
              </span>
            </li>
        </ul>
      </div>
      {/* Mobile Menu */}
      <div className="pt-3">
        <HamburgerButton
          setMobileMenu={setMobileMenu}
          mobileMenu={mobileMenu}
        />
      </div>
      <div className="sm:hidden">
        <div
          className={`${
            mobileMenu ? 'flex' : 'hidden'
          } absolute z-50 flex-col items-center self-end py-8 mt-16 space-y-6 font-bold sm:w-auto left-6 right-6 dark:text-white  bg-gray-50 dark:bg-slate-800 drop-shadow md rounded-xl`}
        >
          {Menus.map((menu, index) => (
            <Link
              to={menu.path}
              key={index}
              onClick={() => setMobileMenu(false)}
            >
              <span
                className={` ${
                  location.pathname === menu.path &&
                  'bg-gray-200 dark:bg-gray-700'
                } p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700`}
              >
                {menu.title}
              </span>
            </Link>
          ))}
            <Link onClick={() => {setMobileMenu(false); help();}}>
              <span>Help</span>
            </Link>
            <Link onClick={() => {setMobileMenu(false); logoutHandler();}}>
              <span>Sign Out</span>
            </Link>
        </div>
      </div>
    </>
  )
}

export default Sidebar
