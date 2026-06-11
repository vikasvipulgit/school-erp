export const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Javiya Schooling System</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f7f9;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #0B1F5C; /* Navy Blue */
            color: #D4AF37; /* Gold */
            padding: 30px;
            text-align: center;
            border-bottom: 4px solid #D4AF37;
        }
        .header h1 {
            margin: 10px 0 0 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
        }
        .footer {
            background-color: #f8f9fa;
            color: #6c757d;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #eeeeee;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0B1F5C;
            color: #D4AF37 !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 20px;
            border: 1px solid #D4AF37;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-approved { background-color: #e6fffa; color: #0694a2; }
        .status-rejected { background-color: #fde8e8; color: #c81e1e; }
        .status-pending { background-color: #feecdc; color: #d97706; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://img.icons8.com/color/96/graduation-cap.png" alt="School Logo" width="60">
            <h1>Javiya Schooling System</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; 2026 Javiya Schooling System. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;
