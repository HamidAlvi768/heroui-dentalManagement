<?php

namespace app\controllers\api;

use app\components\Helper;
use app\models\PatientAppointments;
use app\models\Patients;
use Yii;
use yii\rest\Controller;
use yii\web\Response;
use yii\web\UnauthorizedHttpException;
use app\models\User;
use yii\filters\Cors;

class AppointmentController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => Helper::ApiAllowedOrigins(),
                'Access-Control-Allow-Methods' => ['POST', 'GET', 'OPTIONS'],
                'Access-Control-Allow-Headers' => ['Content-Type', 'Authorization'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 3600,
            ],
        ];

        $behaviors['contentNegotiator']['formats']['application/json'] = Response::FORMAT_JSON;

        return $behaviors;
    }

    public function actions()
    {
        return [
            'options' => [
                'class' => 'yii\rest\OptionsAction',
            ],
        ];
    }

    public function actionCreate()
    {
        if (Yii::$app->request->isPost) {
            $request = json_decode(Yii::$app->request->rawBody, true);

            $token = Yii::$app->request->headers->get('Authorization');
            $token = str_replace('Bearer ', '', $token);

            $user = User::findOne(['access_token' => $token]);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Invalid token',
                ];
            }

            $appointment = new PatientAppointments();
            $appointment->patient_id = $request['patient_id'];
            $appointment->scheduled_by = $user->id;
            $appointment->appointment_date = $request['appointment_date'];
            $appointment->appointment_reason = $request['appointment_reason'];
            $appointment->status = $request['status'];
            $appointment->notes = $request['notes'];

            if ($appointment->save()) {
                return [
                    'success' => true,
                    'message' => 'Appointment created successfully',
                    'appointment' => $appointment,
                ];
            }
            return [
                'success' => false,
                'message' => 'Something went wrong!',
                'errors' => $appointment->getErrors(),
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Method is not correct!',
            ];
        }
    }

    public function actionEdit($id)
    {
        if (Yii::$app->request->isPost) {
            $request = json_decode(Yii::$app->request->rawBody, true);

            $token = Yii::$app->request->headers->get('Authorization');
            $token = str_replace('Bearer ', '', $token);

            $user = User::findOne(['access_token' => $token]);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Invalid token',
                ];
            }

            $appointment = PatientAppointments::findOne($id);
            $appointment->appointment_date = $request['appointment_date'];
            $appointment->appointment_reason = $request['appointment_reason'];
            $appointment->status = $request['status'];
            $appointment->notes = $request['notes'];

            if ($appointment->save()) {
                return [
                    'success' => true,
                    'message' => 'Appointment updated successfully',
                    'appointment' => $appointment,
                ];
            }
            return [
                'success' => false,
                'message' => 'Something went wrong!',
                'errors' => $appointment->getErrors(),
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Method is not correct!',
            ];
        }
    }

    public function actionDelete()
    {
        if (Yii::$app->request->isPost) {
            $request = json_decode(Yii::$app->request->rawBody, true);
            $id = Yii::$app->request->get('id') ?? ($request['id'] ?? null);

            if (!$id) {
                return [
                    'success' => false,
                    'message' => 'Appointment ID is required',
                ];
            }

            $token = Yii::$app->request->headers->get('Authorization');
            $token = str_replace('Bearer ', '', $token);

            $user = User::findOne(['access_token' => $token]);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Invalid token',
                ];
            }

            $appointment = PatientAppointments::findOne($id);
            
            if (!$appointment) {
                return [
                    'success' => false,
                    'message' => 'Appointment not found',
                ];
            }

            if ($appointment->delete()) {
                return [
                    'success' => true,
                    'message' => 'Appointment deleted successfully',
                ];
            }
            return [
                'success' => false,
                'message' => 'Something went wrong!',
                'errors' => $appointment->getErrors(),
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Method is not correct!',
            ];
        }
    }


    public function actionList()
    {
        $token = Yii::$app->request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        $user = User::findOne(['access_token' => $token]);
        if (!$user) {
            return [
                'success' => false,
                'message' => 'Invalid token',
            ];
        }

        // Read query parameters from frontend
        $request = Yii::$app->request;
        $page = (int)$request->get('page', 1);
        $perpage = (int)$request->get('perpage', 5);
        $sort = $request->get('sort', 'created_at'); // e.g. username, email
        $order = strtolower($request->get('order', 'desc')) === 'desc' ? SORT_DESC : SORT_ASC;

        // Build query
        $query = PatientAppointments::find();

        // $category_id = $request->get('category_id', '');
        // if (!empty($category_id)) {
        //     $query->andFilterWhere(['like', 'inventory.category_id', $category_id]);
        // }

        // $name = $request->get('name', '');
        // if (!empty($name)) {
        //     $query->andFilterWhere(['like', 'inventory.name', $name]);
        // }

        // $code = $request->get('code', '');
        // if ($code !== '') {
        //     $query->andFilterWhere(['inventory.code' => $code]);
        // }

        // $quantity = $request->get('quantity', '');
        // if ($quantity !== '') {
        //     $query->andFilterWhere(['inventory.quantity' => $quantity]);
        // }

        // // Filter by verified status
        // $active = $request->get('active', '');
        // if ($active !== '') {
        //     $query->andFilterWhere(['inventory.active' => $active]);
        // }

        $total = $query->count();

        $data = $query
            ->orderBy([$sort => $order])
            ->offset(($page - 1) * $perpage)
            ->limit($perpage)
            ->asArray()
            ->all();

        $patients = User::find()->where(['role' => 'patient'])->asArray()->all();

        return [
            'success' => true,
            'message' => 'Data fetched successfully',
            'data' => $data,
            'patients' => $patients,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'perpage' => $perpage
            ]
        ];
    }
}
