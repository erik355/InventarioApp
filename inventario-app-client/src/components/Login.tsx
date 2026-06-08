import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !contraseña.trim()) {
      setError('Por favor, ingresa el usuario y la contraseña.');
      return;
    }

    setCargando(true);
    setError(null);

    try {
      // Llamada directa al endpoint del backend.
      // Recuerda que el backend espera PascalCase: Usuario y Contraseña
      const respuesta = await axios.post('http://localhost:5133/api/auth/login', {
        Usuario: usuario.trim(),
        Contraseña: contraseña.trim()
      });

      const { token } = respuesta.data;
      if (token) {
        localStorage.setItem('token', token);
        onLoginSuccess(token);
      } else {
        setError('Error al recibir las credenciales del servidor.');
      }
    } catch (err: any) {
      console.error('Error de login:', err);
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas (Usuario o contraseña inválida).');
      } else {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#646cff' }}>🔐 Acceso Corporativo</h2>
        <p style={{ textAlign: 'center', color: '#888', marginTop: '0', fontSize: '0.9rem', marginBottom: '24px' }}>
          Ingresa tus credenciales del panel de control
        </p>

        {error && (
          <div style={{
            padding: '10px 15px',
            background: 'rgba(244, 67, 54, 0.15)',
            borderLeft: '4px solid #f44336',
            color: '#ff8a80',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#ccc' }}>Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ej: admin"
              disabled={cargando}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #444',
                background: '#1a1a1a',
                color: '#fff',
                borderRadius: '6px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#ccc' }}>Contraseña</label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              placeholder="••••"
              disabled={cargando}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #444',
                background: '#1a1a1a',
                color: '#fff',
                borderRadius: '6px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              padding: '12px',
              background: '#646cff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.7 : 1,
              marginTop: '10px',
              transition: 'background-color 0.2s'
            }}
          >
            {cargando ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
          Pista de desarrollo: admin / 1234
        </div>
      </div>
    </div>
  );
}
