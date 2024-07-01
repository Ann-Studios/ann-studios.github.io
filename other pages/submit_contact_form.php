<?php
// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the form data
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    // Validate the data
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        echo "All fields are required.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format.";
        exit;
    }

    // Create the email content
    $to = "contact@ann-studios.com"; // Replace with your email address
    $headers = "From: $name <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $email_subject = "Contact Form Submission: $subject";
    $email_body = "You have received a new message from the contact form on your website.\n\n" .
        "Name: $name\n" .
        "Email: $email\n" .
        "Subject: $subject\n" .
        "Message:\n$message\n";

    // Send the email
    if (mail($to, $email_subject, $email_body, $headers)) {
        echo "Thank you for your message. We will get back to you shortly.";
    } else {
        echo "Sorry, something went wrong. Please try again later.";
    }
} else {
    echo "Invalid request.";
}