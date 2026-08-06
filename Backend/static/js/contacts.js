// Wait until page loads
document.addEventListener("DOMContentLoaded", function () {

    console.log("Contacts Page Loaded");

    // Confirmation before adding trusted contact
    const forms = document.querySelectorAll("form[action='/dashboard/add_trusted_contact/']");

    forms.forEach(function(form) {

        form.addEventListener("submit", function(e) {

            const confirmAdd = confirm("Add this contact to Trusted Contacts?");

            if (!confirmAdd) {
                e.preventDefault();
            }

        });

    });

});