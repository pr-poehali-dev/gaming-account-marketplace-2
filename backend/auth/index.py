import json
import os
import psycopg2
import hashlib
import secrets
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Авторизация пользователей (регистрация, вход, проверка токенов)
    Args: event с httpMethod, body для регистрации/входа
    Returns: HTTP response с токеном или ошибкой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', 'login')
    
    try:
        if method == 'POST' and action == 'register':
            body_data = json.loads(event.get('body', '{}'))
            username = body_data.get('username', '').strip()
            email = body_data.get('email', '').strip()
            password = body_data.get('password', '')
            
            if not all([username, email, password]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все поля'})
                }
            
            if len(password) < 6:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пароль должен быть минимум 6 символов'})
                }
            
            cursor.execute(
                'SELECT id FROM t_p18833766_gaming_account_marke.users WHERE email = %s',
                (email,)
            )
            if cursor.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email уже зарегистрирован'})
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            token = secrets.token_urlsafe(32)
            
            cursor.execute('''
                INSERT INTO t_p18833766_gaming_account_marke.users 
                (username, email, password_hash, balance, is_online)
                VALUES (%s, %s, %s, 1000, true)
                RETURNING id, username, email, balance, rating, reviews_count
            ''', (username, email, password_hash))
            
            user_row = cursor.fetchone()
            conn.commit()
            
            user_data = {
                'id': user_row[0],
                'username': user_row[1],
                'email': user_row[2],
                'balance': user_row[3],
                'rating': float(user_row[4]) if user_row[4] else 0,
                'reviews_count': user_row[5]
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': user_data,
                    'message': 'Регистрация успешна! +1000₽ на счёт'
                })
            }
        
        elif method == 'POST' and action == 'login':
            body_data = json.loads(event.get('body', '{}'))
            email = body_data.get('email', '').strip()
            password = body_data.get('password', '')
            
            if not all([email, password]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все поля'})
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cursor.execute('''
                SELECT id, username, email, password_hash, balance, rating, reviews_count
                FROM t_p18833766_gaming_account_marke.users 
                WHERE email = %s
            ''', (email,))
            
            user_row = cursor.fetchone()
            if not user_row or user_row[3] != password_hash:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
            
            cursor.execute(
                'UPDATE t_p18833766_gaming_account_marke.users SET is_online = true WHERE id = %s',
                (user_row[0],)
            )
            conn.commit()
            
            token = secrets.token_urlsafe(32)
            
            user_data = {
                'id': user_row[0],
                'username': user_row[1],
                'email': user_row[2],
                'balance': user_row[4],
                'rating': float(user_row[5]) if user_row[5] else 0,
                'reviews_count': user_row[6]
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': user_data,
                    'message': 'Вход выполнен успешно'
                })
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not found'})
            }
    
    finally:
        cursor.close()
        conn.close()
