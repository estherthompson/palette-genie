import {useState} from "react" ;


export default function Login(){
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassord] = useState("");
   

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log({email, username, password})
    };

    return (

        <div> hello from login</div>

    );

}