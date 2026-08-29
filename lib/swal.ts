import Swal from 'sweetalert2';

// Standard centered alert with dark theme
export const Alert = Swal.mixin({
  customClass: {
    popup: 'bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl',
    title: 'text-white font-bold',
    htmlContainer: 'text-zinc-400',
    confirmButton: 'bg-orange-500 hover:bg-orange-600 text-black font-bold py-2.5 px-6 rounded-xl transition-colors ml-2',
    cancelButton: 'bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl border border-white/10 transition-colors mr-2'
  },
  buttonsStyling: false,
  background: '#09090b',
  color: '#fff'
});

// Small toast notification for the top right
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'bg-zinc-900 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl',
    title: 'text-white text-sm font-medium',
  },
  background: '#09090b',
  color: '#fff',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});
