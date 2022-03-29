document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields and makes recipients editable
  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').innerHTML = '';

}

function send_email(){
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').innerHTML;


  //Hides compose view and redirects to sent e-mails
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  load_mailbox('sent');
  event.preventDefault(); //Prevents refreshing the page before the POST function
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })


}

function load_mailbox(mailbox) {


  // Show the mailbox name and email list div
  document.querySelector('#emails-header').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch_message = "/emails/" + mailbox;
  fetch(fetch_message)
    .then(response => response.json())

    .then(emails => {
        document.querySelector('#emails-list').innerHTML = "";
        let table = document.createElement('table');
        table.className = 'table';
        table.style.border = '1px solid grey';
        console.log(emails);
        emails.forEach(show_email);
        function show_email(email) {
            //Grey background for read, white for unread
            if (!email.read)
                background = "#FFFFFF";
            else
                background = "#D8D8D8";
            let row =  document.createElement('tr');
            row.style.border = '1px solid grey';
            row.style.cursor = 'pointer';
            row.style.backgroundColor = background;
            let email_address = `${email.sender}`;
            if (mailbox == 'sent'){
                email_address = `To: ${email.recipients}`;
            }
            row.innerHTML = `<td class="col-md-3"><b>${email_address}</b></td> <td class="col-md-7">${email.subject}</td> <td>${email.timestamp}</td>`;
            //Makes the e-mail clickable
            row.addEventListener('click', function load_email() {
                document.querySelector('#email-view').style.display = 'block';
                document.querySelector('#emails-view').style.display = 'none';
                document.querySelector('#compose-view').style.display = 'none';
                fetch(`/emails/${email.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      read: true
                  })
                })
                if (email.archived){
                    document.querySelector('#email-archive').setAttribute('title','Unarchive e-mail');
                } else {
                    document.querySelector('#email-archive').setAttribute('title','Archive e-mail');
                }
                document.querySelector('#email-id').value = `${email.id}`;
                document.querySelector('#email-sender').innerHTML = `<b>From:</b> ${email.sender}`;
                document.querySelector('#email-recipient').innerHTML = `<b>To:</b> ${email.recipients}`;
                document.querySelector('#email-subject').innerHTML = `<b>Subject:</b> ${email.subject}`;
                document.querySelector('#email-timestamp').innerHTML = `<b>Timestamp:</b> ${email.timestamp}`;
                document.querySelector('#email-body').innerHTML = `${email.body}`;

            });

            //Highlights the e-mail being hovered
            row.addEventListener('mouseover', function hover() {
                row.style.border = '2px solid #0c96f2';
            });
            row.addEventListener('mouseleave', function unhover() {
                row.style.border = '1px solid grey';
            });
            table.appendChild(row);
        }
        document.querySelector('#emails-list').append(table);
    })

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

}

function archive(){
    const id = document.querySelector('#email-id').value;
    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
            if (email.archived) {
                put_archive = false;
            }
            else {
                put_archive = true;
            }
            fetch(`/emails/${id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: put_archive
                  })
                })
            document.querySelector('#emails-list').innerHTML = "";
            load_mailbox("inbox");
        });
}

function reply(){
  const id = document.querySelector('#email-id').value;

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
            document.querySelector('#compose-recipients').value = email.sender;
            document.querySelector('#compose-recipients').disabled = true;
            if (email.subject.substring(0,4) != "Re: "){
                document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
            } else {
                document.querySelector('#compose-subject').value = email.subject;
            }
            document.querySelector('#compose-body').innerHTML = `<br><hr><b>On ${email.timestamp}, ${email.sender} wrote:</b><br>${email.body}` ;
        });

}