import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: motDePasse })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail)
      localStorage.setItem('token', data.access_token)
      navigate('/')
    } catch (err) {
      setErreur(err.message || 'Erreur de connexion')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div style={{backgroundColor: '#1a2744', minHeight: '100vh'}} className="flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🏛️</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">AidesPubliques</h1>
          <p className="text-gray-500 mt-1">Connectez-vous à votre espace</p>
        </div>

        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={chargement}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login