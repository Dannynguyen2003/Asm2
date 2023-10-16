// main.js
const update = document.querySelector('#update-button')

const deleteButton = document.querySelector('#delete-button')


function checkFormInput() {
    const productName = document.querySelector('input[name="product_name"]').value;
    const productDescription = document.querySelector('textarea[name="product_description"]').value;
    const productPrice = document.querySelector('input[name="product_price"]').value;
    const productQuantity = document.querySelector('input[name="product_quantity"]').value;
    const productImage = document.querySelector('input[name="product_image"]').value;

    if (
        !productName ||
        !productDescription ||
        !productPrice ||
        !productQuantity ||
        !productImage
    ) {
        openErrorModal(); // Show the error modal
        return false; // Prevent form submission
    }
}

// Function to open the error modal
function openErrorModal() {
    const modal = document.getElementById("errorModal");
    modal.style.display = "block";
}

// Function to close the error modal
function closeErrorModal() {
    const modal = document.getElementById("errorModal");
    modal.style.display = "none";
}

// Add an event listener to the close button
const closeErrorModalButton = document.getElementById("closeErrorModal");
closeErrorModalButton.addEventListener("click", closeErrorModal);

function showNotification(message, success) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add(success ? 'success' : 'error', 'show');

  // Automatically hide the notification after a few seconds (adjust the timeout as needed)
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000); // Hide after 3 seconds
}

// In your deleteProduct function (where you handle the deletion)
function deleteProduct(productId) {
  fetch(`/delete-product/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      showNotification('Product deleted successfully', true);
      // Optionally, you can reload the page or update the UI here
    } else {
      showNotification('Error deleting product', false);
      console.error('Error deleting product');
    }
  })
  .catch(error => {
    showNotification('Error deleting product', false);
    console.error('Error deleting product:', error);
  });
}