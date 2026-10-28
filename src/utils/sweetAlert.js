
import Swal from "sweetalert2";
import "./sweetAlert.css";

const COLORS = {
  background: "#f6f3ec",
  color: "#171713",
  confirmButtonColor: "#394132",
  cancelButtonColor: "#77776e",
  customClass: {
    popup: "hoh-swal-popup",
    title: "hoh-swal-title",
    htmlContainer: "hoh-swal-text",
    confirmButton: "hoh-swal-confirm",
    cancelButton: "hoh-swal-cancel",
    icon: "hoh-swal-icon",
    actions: "hoh-swal-actions",
  },
  buttonsStyling: false,
};

export const showSuccess = (title, text = "") =>
  Swal.fire({
    ...COLORS,
    icon: "success",
    title,
    text,
    confirmButtonText: "CONTINUE",
  });

export const showError = (title, text = "") =>
  Swal.fire({
    ...COLORS,
    icon: "error",
    title,
    text,
    confirmButtonText: "TRY AGAIN",
  });

export const showWarning = (title, text = "") =>
  Swal.fire({
    ...COLORS,
    icon: "warning",
    title,
    text,
    confirmButtonText: "UNDERSTOOD",
  });

export const showConfirm = async (title, text = "") => {
  const result = await Swal.fire({
    ...COLORS,
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "YES, CONTINUE",
    cancelButtonText: "CANCEL",
    reverseButtons: true,
    focusCancel: true,
  });

  if (result && result.isConfirmed) {
    return { ...result, isConfirmed: true };
  }
  return null;
};

export const showLoading = (title = "Please wait...") =>
  Swal.fire({
    ...COLORS,
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

export const closeAlert = () => Swal.close();

export const showToast = (title, icon = "success") =>
  Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: COLORS.background,
    color: COLORS.color,
    customClass: {
      popup: "hoh-swal-toast",
      title: "hoh-swal-toast-title",
    },
  });
