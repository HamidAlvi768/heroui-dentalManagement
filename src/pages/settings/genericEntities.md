<?php

namespace app\controllers\api;

use app\components\Helper;
use app\models\GenericEntities;
use app\models\GenericRecords;
use app\models\Inventory;
use app\models\InventoryCategories;
use Yii;
use yii\rest\Controller;
use yii\web\Response;
use yii\web\UnauthorizedHttpException;
use app\models\User;
use yii\filters\Cors;

class GenericrecordsController extends Controller
{

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        // CORS filter must be added *before* contentNegotiator
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

        // This must be AFTER corsFilter
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

            $gr = new GenericRecords();
            $gr->entity_type = $request['entity_type'];
            $gr->label = $request['label'];
            $gr->description = $request['description'] ?? null; // Handle null value
            $gr->meta = $request['meta'] ?? null; // Handle null value
            // $gr->active = intval($request['active']) == 1 ? 1 : 0; // Convert to integer (0 or 1)

            if ($gr->save()) {
                return [
                    'success' => true,
                    'message' => 'Generic Recrods added successfully',
                    'category_id' => $gr->id,
                    'category' => $gr
                ];
            }
            return [
                'success' => false,
                'message' => 'Something went wrong!',
                'errors' => $gr->getErrors()
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

            $gr = GenericRecords::findOne($id);
            $gr->entity_type = $request['entity_type'];
            $gr->label = $request['label'];
            $gr->description = $request['description'];
            $gr->meta = $request['meta'];
            // $gr->active = intval($request['active']) == 1 ? 1 : 0; // Convert to integer (0 or 1)

            if ($gr->save()) {

                return [
                    'success' => true,
                    'message' => 'Generic records updated successfully',
                    'category_id' => $gr->id,
                    'category' => $gr
                ];
            }
            return [
                'success' => false,
                'message' => 'Something went wrong!',
                'errors' => $gr->getErrors()
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

            $token = Yii::$app->request->headers->get('Authorization');
            $token = str_replace('Bearer ', '', $token);

            $user = User::findOne(['access_token' => $token]);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Invalid token',
                ];
            }

            $itemToDelete = GenericRecords::findOne($request['id']);
            if ($user == $itemToDelete) {
                return [
                    'success' => false,
                    'message' => 'You cannot delete yourself!',
                ];
            }

            if ($itemToDelete->delete()) {
                return [
                    'success' => true,
                    'message' => 'Item deleted successfully',
                ];
            }
            return [
                'success' => false,
                'message' => 'Something went wrong!',
                'errors' => $itemToDelete->getErrors()
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Method is not correct!',
            ];
        }
    }

    public function actionView()
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

        return [
            'success' => true,
            'message' => 'User profile fetched successfully',
            'id' => $user->id,
            'username' => $user->username,
        ];
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
        $query = GenericRecords::find();

        $entity_type = $request->get('entity_type', '');
        if (!empty($entity_type)) {
            $query->andFilterWhere(['like', 'entity_type', $entity_type]);
        }

        $label = $request->get('label', '');
        if (!empty($label)) {
            $query->andFilterWhere(['like', 'generic_records.label', $label]);
        }


        // Filter by verified status
        $active = $request->get('active', '');
        if ($active !== '') {
            $query->andFilterWhere(['generic_records.active' => $active]);
        }

        $total = $query->count();

        $data = $query
            ->orderBy([$sort => $order])
            ->offset(($page - 1) * $perpage)
            ->limit($perpage)
            ->asArray()
            ->all();

        $entities = GenericEntities::find()->asArray()->all();

        return [
            'success' => true,
            'message' => 'Data fetched successfully',
            'data' => $data,
            'entities' => $entities,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'perpage' => $perpage
            ]
        ];
    }
}
