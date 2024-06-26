import React from 'react'
import { useState, useEffect } from 'react';
import Axios from '../../config/Axios';
import { Tooltip } from '@material-tailwind/react';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../../slices/authSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom';
import { logout } from '../../slices/authSlice';
import { useLogoutMutation } from '../../slices/usersApiSlice';
import ConfirmDialog from '../../components/ConfirmDialog';
const Wallet = () => {

    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);

    const acceptDeposit = () => {
      console.log('deposit accepted');
      handleSubmitDeposit();
    }

    const acceptWithdraw = () => {
        console.log('withdraw accepted');
        handleSubmitWithdraw();
      }

    const { userInfo } = useSelector((state)=>state.auth);
    const email = userInfo.email;

    const [isActive, setIsActive] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();

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
        const fetchData = async () => {
          try {
            const response = await Axios.get('/api/users/');
            console.log(response.data);
            dispatch(setCredentials({ ...response.data }));
            
          } catch (error) {
            console.error(error.message);
            logoutHandler();
          };
        };
        fetchData();
      }, []); 

    const handleClickDeposit = () => {
      setIsActive(!isActive);
    };

    const handleClickWithdraw = () => {
        setIsActive(!isActive);
      };

    const [selectedToken, setSelectedToken] = useState("USDT ERC20");

    const handleTokenChange = (event) => {
      setSelectedToken(event.target.value);
    };

    const [dAmount, setDamount] = useState();
    const [wAmount, setWamount] = useState();

    const handleChangeDeposit = (e) => {
        e.preventDefault();
        setDamount(e.target.value);
    }

    const handleChangeWithdraw = (e) => {
        e.preventDefault();
        setWamount(e.target.value);
    }
 
    const handleSubmitDeposit = () => {
        Axios
        .put("/api/balance/invoice", {email, dAmount})
        .then( res => {
            console.log(res.data);
            const invoice_id = res.data.invoice_id;
            const payment_id = res.data.payment_id;
            window.location.assign('https://nowpayments.io/payment/?iid=' + invoice_id + '&paymentId=' + payment_id);
            //dispatch(setCredentials({ ...res.data }));
            //toast.success("Successful Deposit!", {autoClose: 2000, pauseOnHover: false, closeOnClick: true, theme: "dark",});
            //setDamount("");
        })
        .catch(err => {
            // toast.error(res.data.message, {autoClose: 1000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark",});
            toast.error(err.response.data.message, {autoClose: 2000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark",});
        });
    }

    const handleSubmitWithdraw = () => {
        Axios
        .put("/api/balance/withdraw", {email, wAmount})
        .then( res => {
            dispatch(setCredentials({ ...res.data }));
            toast.success("Withdrawal request sent successfully!", {autoClose: 2000, pauseOnHover: false, closeOnClick: true, theme: "dark",});
            setWamount("");
        })
        .catch(err => {
            // toast.error(res.data.message, {autoClose: 1000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark",});
            toast.error(err.response.data.message, {autoClose: 1000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark",});
        });
    }

      
    return (
    <div className='dark:text-white '>
          { showDeposit &&
            <ConfirmDialog accept={acceptDeposit} show={showDeposit} handleShow={setShowDeposit} title='Deposit' content={`Do you want to deposit $${dAmount}?`} confirm='Deposit' confirmColor='yellow'/> }
          { showWithdraw &&
            <ConfirmDialog accept={acceptWithdraw} show={showWithdraw} handleShow={setShowWithdraw} title='Withdraw' content={`Do you want to withdraw $${wAmount}?`} confirm='Withdraw' confirmColor='yellow'/> }
        <div className='flex sm:mt-10 mt-16'>
            <button
            className={`w-[40%] p-2 rounded-l-lg font-semibold text-lg ${
                isActive ? "bg-slate-700 shadow-md shadow-cyan-400" : "bg-slate-700 shadow-md shadow-black"
            } ml-auto`}
            onClick={handleClickDeposit}
            >
            Deposit
            </button>
            <button
            className={`w-[40%] p-2 rounded-r-lg font-semibold text-lg ${
                !isActive ? "bg-slate-700  shadow-md shadow-cyan-400" : "bg-slate-700 shadow-md shadow-black"
            } mr-auto`}
            onClick={handleClickWithdraw}
            >
            Withdraw
            </button>
        </div>
        
        <form className={`${isActive?'':'hidden'}`} onSubmit={(e)=>{e.preventDefault(); setShowDeposit(true);}}>
            <div className='w-[80%] mx-auto mt-12'>
                <div className='flex px-4'>
                    <label htmlFor='depositAmount' className='w-[20%] text-md font-mono my-auto'>Deposit Amount </label>
                    <input type='text' id='depositAmount' value={dAmount} onChange={(handleChangeDeposit)} placeholder='Minium $10' className='text-gray-900 text-md font-mono w-[80%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400  dark:text-cyan-400 font-bold' required></input>                
                </div>
                <div className='px-4 mt-12'>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 grid-cols-2 gap-2">
                        <label
                        className={`col-span-1 py-5 px-4 hover:bg-gray-900 hover:cursor-pointer rounded-2xl font-bold text-lg  ${
                            selectedToken === "USDT ERC20" ? "bg-gray-900 text-white border-2 border-cyan-400" : "bg-slate-700 shadow-md shadow-black"
                        }`}
                        >
                        <input
                            type="radio"
                            value="USDT ERC20"
                            checked={selectedToken === "USDT ERC20"}
                            onChange={handleTokenChange}
                            style={{marginRight:"0.5rem"}}
                        />
                        USDT ERC20
                        </label>
                        <label
                        className={`col-span-1 py-5 px-4 hover:bg-gray-900 hover:cursor-pointer rounded-2xl font-bold text-lg  ${
                            selectedToken === "USDT TRC20" ? "bg-gray-900 text-white border-2 border-cyan-400": " bg-slate-700 shadow-md shadow-black"
                        }`}
                        >
                        <input
                            type="radio"
                            value="USDT TRC20"
                            checked={selectedToken === "USDT TRC20"}
                            onChange={handleTokenChange}
                            style={{marginRight:"0.5rem"}}
                        />
                        USDT TRC20
                        </label>
                        <label
                        className={`col-span-1 py-5 px-4 hover:bg-gray-900 hover:cursor-pointer rounded-2xl font-bold text-lg  ${
                            selectedToken === "USDT BSC" ? "bg-gray-900 text-white border-2 border-cyan-400" : "bg-slate-700 shadow-md shadow-black"
                        }`}
                        >
                        <input
                            type="radio"
                            value="USDT BSC"
                            checked={selectedToken === "USDT BSC"}
                            onChange={handleTokenChange}
                            style={{marginRight:"0.5rem"}}
                        />
                        USDT BSC
                        </label>
                        <label
                        className={`col-span-1 py-5 px-4 hover:bg-gray-900 hover:cursor-pointer rounded-2xl font-bold text-lg  ${
                            selectedToken === "USDC" ? "bg-gray-900 text-white border-2 border-cyan-400" : "bg-slate-700 shadow-md shadow-black"
                        }`}
                        >
                        <input
                            type="radio"
                            value="USDC"
                            checked={selectedToken === "USDC"}
                            onChange={handleTokenChange}
                            style={{marginRight:"0.5rem"}}
                        />
                        USDC
                        </label>
                       
                    </div>
                </div>

            </div>
            <div className='flex'>
                <button className='sm:w-44 w-36 text-center mt-10 ml-auto mr-10 p-4 bg-cyan-500 hover:text-white text-slate-200 rounded-xl sm:text-3xl text-2xl font-bold'>PAY NOW</button>
                <div className='mt-14 mr-auto'>
                    <Tooltip content="Deposit History" placement="right">
                        <svg
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        className='w-10 h-10 font-bold text-lg hover:cursor-pointer'
                        >
                        <path d="M8.515 1.019A7 7 0 008 1V0a8 8 0 01.589.022l-.074.997zm2.004.45a7.003 7.003 0 00-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 00-.439-.27l.493-.87a8.025 8.025 0 01.979.654l-.615.789a6.996 6.996 0 00-.418-.302zm1.834 1.79a6.99 6.99 0 00-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 00-.214-.468l.893-.45a7.976 7.976 0 01.45 1.088l-.95.313a7.023 7.023 0 00-.179-.483zm.53 2.507a6.991 6.991 0 00-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 01-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 01-.401.432l-.707-.707z" />
                        <path d="M8 1a7 7 0 104.95 11.95l.707.707A8.001 8.001 0 118 0v1z" />
                        <path d="M7.5 3a.5.5 0 01.5.5v5.21l3.248 1.856a.5.5 0 01-.496.868l-3.5-2A.5.5 0 017 9V3.5a.5.5 0 01.5-.5z" />
                        </svg>
                    </Tooltip>
                </div>
            </div>
        </form>

        <form className={`${isActive?'hidden':''}`} onSubmit={(e)=>{e.preventDefault(); setShowWithdraw(true);}}>
            <div className='w-[80%] mx-auto mt-8'>
                <div className='flex px-4'>
                    <label htmlFor='withdrawAmount' className='w-[20%] text-md font-mono my-auto'>Withdraw Amount </label>
                    <input type='text' id='withdrawAmount' value={wAmount} onChange={handleChangeWithdraw} placeholder='Minium $10' className='text-gray-900 text-md font-mono w-[80%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400  dark:text-cyan-400 font-bold' required></input>                
                </div>
                <div className='flex px-4 mt-4'>
                    <div className='flex w-[20%] mr-1'>
                        <button className=' bg-yellow-400 h-10 my-auto mr-auto hover:bg-yellow-500 rounded-md text-black px-1 font-bold font-mono text-sm'>Connect Wallet</button>
                    </div>
                    <input type='text' placeholder='Wallet Address' className='text-gray-900 text-md font-mono w-[80%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400  dark:text-cyan-400 font-bold focus:outline-none' readOnly></input>
                </div>

                <div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 grid-cols-2 mt-8 gap-2 px-4">
                        <label
                        className={`col-span-1 py-5 px-4 hover:bg-gray-900 hover:cursor-pointer rounded-2xl font-bold text-lg  ${
                            selectedToken === "USDT ERC20" ? "bg-gray-900 text-white border-2 border-cyan-400" : "bg-slate-700 shadow-md shadow-black"
                        }`}
                        >
                        <input
                            type="radio"
                            value="USDT ERC20"
                            checked={selectedToken === "USDT ERC20"}
                            onChange={handleTokenChange}
                            style={{marginRight:"0.5rem"}}
                        />
                        USDT ERC20
                        </label>
                        <label
                        className={`col-span-1 py-5 px-4 hover:bg-gray-900 hover:cursor-pointer rounded-2xl font-bold text-lg  ${
                            selectedToken === "USDT TRC20" ? "bg-gray-900 text-white border-2 border-cyan-400": " bg-slate-700 shadow-md shadow-black"
                        }`}
                        >
                        <input
                            type="radio"
                            value="USDT TRC20"
                            checked={selectedToken === "USDT TRC20"}
                            onChange={handleTokenChange}
                            style={{marginRight:"0.5rem"}}
                        />
                        USDT TRC20
                        </label>
                        <label
                        className={`col-span-1 py-5 px-4 hover:bg-gray-900 hover:cursor-pointer rounded-2xl font-bold text-lg  ${
                            selectedToken === "USDT BSC" ? "bg-gray-900 text-white border-2 border-cyan-400" : "bg-slate-700 shadow-md shadow-black"
                        }`}
                        >
                        <input
                            type="radio"
                            value="USDT BSC"
                            checked={selectedToken === "USDT BSC"}
                            onChange={handleTokenChange}
                            style={{marginRight:"0.5rem"}}
                        />
                        USDT BSC
                        </label>
                        <label
                        className={`col-span-1 py-5 px-4 hover:bg-gray-900 hover:cursor-pointer rounded-2xl font-bold text-lg  ${
                            selectedToken === "USDC" ? "bg-gray-900 text-white border-2 border-cyan-400" : "bg-slate-700 shadow-md shadow-black"
                        }`}
                        >
                        <input
                            type="radio"
                            value="USDC"
                            checked={selectedToken === "USDC"}
                            onChange={handleTokenChange}
                            style={{marginRight:"0.5rem"}}
                        />
                        USDC
                        </label>
                    </div>
                   
                </div>

            </div>
            <div className='flex'>
                <button className='sm:w-44 w-36 text-center mt-12 ml-auto mr-10 p-4 bg-cyan-500 hover:text-white text-slate-200 rounded-xl sm:text-3xl text-2xl font-bold'>Withdraw</button>
                <div className='mt-14 mr-auto'>
                    <Tooltip content="Withdraw History" placement="right">
                        <svg
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        className='w-10 h-10 font-bold text-lg hover:cursor-pointer'
                        >
                        <path d="M8.515 1.019A7 7 0 008 1V0a8 8 0 01.589.022l-.074.997zm2.004.45a7.003 7.003 0 00-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 00-.439-.27l.493-.87a8.025 8.025 0 01.979.654l-.615.789a6.996 6.996 0 00-.418-.302zm1.834 1.79a6.99 6.99 0 00-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 00-.214-.468l.893-.45a7.976 7.976 0 01.45 1.088l-.95.313a7.023 7.023 0 00-.179-.483zm.53 2.507a6.991 6.991 0 00-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 01-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 01-.401.432l-.707-.707z" />
                        <path d="M8 1a7 7 0 104.95 11.95l.707.707A8.001 8.001 0 118 0v1z" />
                        <path d="M7.5 3a.5.5 0 01.5.5v5.21l3.248 1.856a.5.5 0 01-.496.868l-3.5-2A.5.5 0 017 9V3.5a.5.5 0 01.5-.5z" />
                        </svg>
                    </Tooltip>
                </div>
            </div>
        </form>
        <ToastContainer />

    </div>
    );
}

export default Wallet
