import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type NotificationType = 'error' | 'warning' | 'info' | 'success';

export const notify = (message: string, type: NotificationType) => {
    toast[type](message, {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
    });
};
