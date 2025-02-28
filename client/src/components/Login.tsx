import { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { googleSignin, loginUser, IUser } from '../services/user-service'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'

interface LoginProps {
  onLoginSuccess: () => void;
}

function Login({ onLoginSuccess }: LoginProps) {
    const emailInputRef = useRef<HTMLInputElement>(null)
    const passwordInputRef = useRef<HTMLInputElement>(null)

    const login = async () => {
        if (emailInputRef.current?.value && passwordInputRef.current?.value) {
            const user: Partial<IUser> = {
                email: emailInputRef.current?.value,
                password: passwordInputRef.current?.value,
            }
            try {
                const res = await loginUser(user)
                console.log("Login successful:", res)
                onLoginSuccess()
            } catch (e) {
                console.log("Login failed:", e)
            }
        }
    }

    const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const res = await googleSignin(credentialResponse)
            console.log("Google login successful:", res)
            onLoginSuccess()
        } catch (e) {
            console.log("Google login failed:", e)
        }
    }

    const onGoogleLoginFailure = () => {
        console.log("Google login failed")
    }

    return (
        <div className="vstack gap-3 col-md-7 mx-auto">
            <h1>Login</h1>
            
            <div className="form-floating">
                <input 
                    ref={emailInputRef} 
                    type="text" 
                    className="form-control" 
                    id="floatingInput" 
                    placeholder="" 
                />
                <label htmlFor="floatingInput">Email</label>
            </div>
            
            <div className="form-floating">
                <input 
                    ref={passwordInputRef} 
                    type="password" 
                    className="form-control" 
                    id="floatingPassword" 
                    placeholder="" 
                />
                <label htmlFor="floatingPassword">Password</label>
            </div>
            
            <button 
                type="button" 
                className="btn btn-primary" 
                onClick={login}
            >
                <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                Login
            </button>

            <div className="text-center">OR</div>
            
            <GoogleLogin 
                onSuccess={onGoogleLoginSuccess} 
                onError={onGoogleLoginFailure} 
            />
        </div>
    )
}

export default Login