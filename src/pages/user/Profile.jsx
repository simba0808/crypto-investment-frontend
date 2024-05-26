import React from 'react'
import Avatar from '../../assets/avatar12.png'
import { useState, useEffect } from 'react';
import { createRef } from 'react'
import { AiOutlineCloudUpload } from 'react-icons/ai'

import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUpdateUserMutation } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../slices/authSlice';
import { useLogoutMutation } from '../../slices/usersApiSlice';
import Axios from '../../config/Axios';


const Profile = () => {

    const { userInfo } = useSelector((state) => state.auth);
    const [avatarID, setAvatarID] = useState(userInfo.avatar);
    const [avatar, setAvatar] = useState();
    const [isPreview, setIsPreview] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState();
    const [file, setFile] = useState();
    const inputFileRef = createRef(null);
    // const [newImage,setNewImage]=useState(null);

    const [username, setUsername] = useState(userInfo.username);
    const [password, setPassword] = useState("");
    const [referral_link, setReferral_link] = useState(userInfo.referral_link);
    const link = userInfo.referral_link;
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [updateProfile, { isLoading }] = useUpdateUserMutation();
    const [isUpdate, setUpdate] = useState(false);

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
                //console.log(response.data);
                dispatch(setCredentials({ ...response.data }));

            } catch (error) {
                console.error(error.message);
                logoutHandler();
            };
        };
        fetchData();
    }, []);

    useEffect(() => {

        const fetchImage = async () => {
            console.log('fetch:' + avatarID);
            const response = await Axios.get(`/api/users/avatar/${userInfo.avatar}`);
            setAvatar(response.data);
        };

        if (userInfo.avatar != '') {
            fetchImage();
        }
    }, [userInfo.avatar]);

    useEffect(() => {
        const updateProfileWithAvatar = async () => {
            const res = await updateProfile({
                _id: userInfo._id,
                username: username,
                referral_link: referral_link,
                password: password,
                newPassword: newPassword,
                avatar: userInfo.avatar,
            }).unwrap();
            console.log(res.data)
            const updatedProfile = Object.assign({}, userInfo, { username: username, referral_link: referral_link});
            dispatch(setCredentials(updatedProfile));

            if(isPreview) {
                toast.success('Profile updated successfully', { autoClose: 3000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark", });
                        setPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setUpdate(false);
                        setIsPreview(false);
            }
        };
        updateProfileWithAvatar();
        
    }, [avatar]);

    const uploadAvatar = async () => {
        try {

            const formData = new FormData();
            if(userInfo.avatar !== '') {
                alert('added')
                formData.append('currentAvatar', userInfo.avatar);
            }
            formData.append('file', file);
            
            const response = await Axios.post('/api/users/upload', formData);
            if (response.data.id) {
                const updatedProfile = Object.assign({}, userInfo, { avatar: response.data.id });
                //console.log(updatedProfile);
                //setImageID(response.data.id);
                //const avatarImage = await response.data.id;
                //alert("res0:" + avatarImage)
                //setAvatarID(avatarImage); 
                //alert("res:" + avatarID)
                dispatch(setCredentials(updatedProfile));
            }

        } catch (error) {
            console.log(error);
        }
    };

    const handleUsername = (e) => {
        e.preventDefault();
        setUsername(e.target.value);
        setUpdate(true);
    }

    const handleLink = (e) => {
        e.preventDefault();
        setReferral_link(e.target.value);
        setUpdate(true);
    }

    const handlePassword = (e) => {
        e.preventDefault();
        setPassword(e.target.value);
        setUpdate(true);
    }

    const handleNewPassword = (e) => {
        e.preventDefault();
        setNewPassword(e.target.value);
        setUpdate(true);
    }

    const handleConfirmPassword = (e) => {
        e.preventDefault();
        setConfirmPassword(e.target.value);
        setUpdate(true);
    }

    const handleOnChange = async (event) => {

        setIsPreview(true);
        setFile(event.target.files[0]);

        const previewFile = event.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            setAvatarPreview(reader.result);
        };

        if (previewFile) {
            reader.readAsDataURL(previewFile);
        }
        //   setNewImage(file);*/
        setUpdate(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        // console.log((!newPassword^!password)&&(!password^!confirmPassword));
        //setAvatarPreview(false);
        if ((!password ^ !newPassword)) {
            toast.error('Check Passwork Field!', { autoClose: 2000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark", });
            return;
        } else if (newPassword != confirmPassword) {
            toast.error('Do not match password', { autoClose: 3000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark", });
            return;
        } else if (!validatePassword(newPassword) && newPassword) {
            toast.error('Must contain 8 characters including special characters and numbers', { autoClose: 3000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark", });
            return;
        }
        if (isPreview === true) {
            await uploadAvatar();
            //setAvatarPreview(false);
        }
        else {
            if (avatarID || (password && newPassword) || (username != userInfo.username) || referral_link) {
                try {
                    const res = await updateProfile({
                        _id: userInfo._id,
                        username: username,
                        referral_link: referral_link,
                        password: password,
                        newPassword: newPassword,
                        avatar: userInfo.avatar,
                    }).unwrap();

                    //console.log(res);
                    dispatch(setCredentials({ ...res }));
                    console.log(userInfo.username);
                    toast.success('Profile updated successfully', { autoClose: 3000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark", });
                    setPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setUpdate(false);
                } catch (err) {
                    toast.error(err?.data?.message || err.error, { autoClose: 3000, hideProgressBar: true, pauseOnHover: false, closeOnClick: true, theme: "dark", });
                }
            }
        }
    };

    const validatePassword = (password) => {
        // Check if the password is empty
        if (!password) {
            return false;
        }

        // Check if the password is at least 8 characters long
        if (password.length < 8) {
            return false;
        }

        // Check if the password contains at least one uppercase letter
        // if (!/[A-Z]/.test(password)) {
        // 	return false;
        // }

        // Check if the password contains at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            return false;
        }

        // Check if the password contains at least one number
        if (!/[0-9]/.test(password)) {
            return false;
        }

        if (!/[!@#$%^&*]/.test(password)) {
            return false;
        }

        return true;
    };

    return (
        <div className='dark:text-white justify-center items-center h-full'>
            <div className='sm:w-[60%] xs:w-[60%] w-full mx-auto sm:mt-10 mt-16'>
                <div className="relative">
                    <input
                        ref={inputFileRef}
                        accept="image/*"
                        hidden
                        id="avatar-image-upload"
                        type="file"
                        onChange={handleOnChange}
                    />
                    <label htmlFor="avatar-image-upload">
                        {
                            avatar ?
                                <img src={`${isPreview ? `${avatarPreview}` : `data: image/jpeg;base64,${avatar}`}`} className="relative w-36 h-36 ml-auto mr-auto rounded-full opacity-95 hover:cursor-pointer hover:scale-110 z-10" alt="Avatar" />
                                :
                                <img src={Avatar} className="relative w-36 h-36 ml-auto mr-auto rounded-full opacity-95 hover:cursor-pointer hover:scale-110 z-10" alt="Avatar" />
                        }
                        {/* <img  src={Avatar}  className="relative w-36 ml-auto mr-auto rounded-full opacity-80 hover:cursor-pointer hover:scale-110 z-10" alt="Avatar"/> */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:cursor-pointer z-10">
                            <AiOutlineCloudUpload className='w-10 h-10 text-white' />
                        </div>
                    </label>
                </div>
                <ToastContainer />
                <div className='mt-8 space-y-4'>
                    <div className='flex px-4'>
                        <label htmlFor='username' className='w-[40%] text-md font-mono my-auto'>User Name *</label>
                        <input type='text' id='username' placeholder='username' value={username} className='text-gray-900 text-md font-mono w-[60%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400  dark:text-cyan-400 font-bold' onChange={handleUsername} required></input>
                    </div>
                    <div className='flex px-4'>
                        <label htmlFor='email' className='w-[40%] text-md font-mono my-auto'>Email *</label>
                        <input type='text' id='email' value={userInfo.email} className='text-gray-900 text-md font-mono w-[60%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400  dark:text-cyan-500 cursor-not-allowed font-bold focus:outline-none' readOnly></input>
                    </div>
                    <div className='flex px-4'>
                        <label htmlFor='referral_link' className='w-[40%] text-md font-mono my-auto'>Referal Link</label>
                        {link ? <input type='text' id='referral_link' value={referral_link} className='text-gray-900 text-md font-mono w-[60%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400 cursor-not-allowed  dark:text-cyan-500 font-bold' readOnly></input>
                            : <input type='text' id='referral_link' placeholder='referral link' value={referral_link} className='text-gray-900 text-md font-mono w-[60%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400 dark:text-cyan-400 font-bold' onChange={handleLink}></input>}
                    </div>
                    <div className='flex px-4'>
                        <label htmlFor='password' className='w-[40%] text-md font-mono my-auto'>Current Password</label>
                        <input type='password' id='password' placeholder='password' value={password} onChange={handlePassword} className='text-gray-900 text-md font-mono w-[60%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400  dark:text-cyan-400 font-bold'></input>
                    </div>
                    <div className='flex px-4'>
                        <label htmlFor='newPassword' className='w-[40%] text-md font-mono my-auto'>New Password</label>
                        <input type='password' id='newPassword' placeholder='password' value={newPassword} onChange={handleNewPassword} className='text-gray-900 text-md font-mono w-[60%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400  dark:text-cyan-400 font-bold'></input>
                    </div>
                    <div className='flex px-4'>
                        <label htmlFor='confirmPassword' className='w-[40%] text-md font-mono my-auto'>Retype Password</label>
                        <input type='password' id='confirmPassword' placeholder='password' value={confirmPassword} onChange={handleConfirmPassword} className='text-gray-900 text-md font-mono w-[60%] rounded-lg p-2.5 dark:bg-slate-700 dark:border-gray-400  dark:text-cyan-400 font-bold'></input>
                    </div>
                </div>
                <div className='mt-12 flex'>
                    {isUpdate ? <button className='w-44 text-center mx-auto p-2 bg-cyan-500 hover:text-white text-slate-200 rounded-xl text-3xl font-bold' onClick={handleUpdateProfile}>UPDATE</button>
                        : <button className='w-44 text-center mx-auto p-2 bg-slate-400 hover:text-white text-slate-200 rounded-xl text-3xl font-bold' onClick={() => { return; }}>UPDATE</button>}
                </div>

            </div>
        </div>
    );
}

export default Profile
