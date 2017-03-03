<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>map</title>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta charset="utf-8">
    <!-- new Bootstrap core CSS file -->
    <link rel="stylesheet"
          href="//cdn.bootcss.com/bootstrap/3.3.5/css/bootstrap.min.css">

    <!-- Bootstrap theme-->
    <link rel="stylesheet"
          href="//cdn.bootcss.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">

    <!-- jQuery file, referring before bootstrap.min.js -->
    <script src="//cdn.bootcss.com/jquery/1.11.3/jquery.min.js"></script>

    <!-- latest Bootstrap core JavaScript file -->
    <script src="//cdn.bootcss.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <style>
        html,body,#map-canvas {
            height: 100%;
        }

        .board {
            height: 800px;
        }
    </style>
</head>
<body>
<div class='container'>
    <div class='row'>
        <div class='col-md-8'>

        </div>
        <div class='col-md-4'>
            <div id='dashboard' class="board">
                <h3>
                    <span class="label label-default">Online users</span>
                </h3>
                <ul id='userList' class="list-group"></ul>
                <ul id="workspace" class = "list-group">

                </ul>
                <div id="input-box" contenteditable="true">

                </div>
                <input id="sendButton" type="button" value="send">
            </div>
        </div>
    </div>
</div>

<!-- modal  -->
<div class="modal fade" id="myModal">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal"
                        aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">Schedule</h4>
            </div>
            <div class="modal-body" id="updateList">
                <ul id='viewSchedule' class="list-group">
                </ul>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
            </div>
        </div>
        <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
</div>
<!-- /.modal -->
</body>
</html>
<!-- AST-Engine:necessary js file -->
<script type="text/javascript" src="cokitjs/util/tools.js"></script>
<script type="text/javascript" src="cokitjs/ASTengine/timestamp.js"></script>
<script type="text/javascript" src="cokitjs/ASTengine/core/basicData.js"></script>
<script type="text/javascript" src="cokitjs/ASTengine/historyBuffer.js"></script>
<script type="text/javascript" src="cokitjs/ASTengine/workflow.js"></script>
<script type="text/javascript" src="cokitjs/ASTengine/pipe.js"></script>
<script type="text/javascript" src="cokitjs/ASTengine/core/ASTEngine.js"></script>
<!-- AST-Engine:necessary js file -->

<!-- customized js file -->
<script type="text/javascript" src="cokitjs/app/basicAPP/chatbox.js"></script>