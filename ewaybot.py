#!/usr/bin/env python
# -*- coding:utf-8 -*-
# 
# Add WASD and armZ support
# 2015.10.13

import os
import time
import subprocess
from socketIO_client import SocketIO, LoggingNamespace
import uuid
import random


class RobotControl(object):
		# =========================================================
		# no need to include the first two methods
    def __init__(self):
        # board
        self.pf_wheel_board = None
        self.pf_arm_board = None
        self.__check_wheel_board()
        self.cam_stream_proc = None
        self.cam_stream_port = None
        self.arm_controlXY = {
        'W' : self.button_arm_forward,
        'A' : self.button_arm_turn_left,
        'S' : self.button_arm_backward,
        'D' : self.button_arm_turn_right,
        'STOP' : self.button_arm_stop,
        }
        self.armBuiltInAction = {
        'INIT': self.button_gst_init,
        'SWING': self.button_gst_swing,
        'WAVE': self.button_gst_wave,
        'STOP': self.button_gst_stop,
        }
        self.camControl = {
        'ON': self.camON,
        'OFF': self.camOFF,
        }

    def __check_wheel_board(self):
        """
        check if wheel board is initlized
        :return: True if is initlized, False otherwise
        """
        print("wheel board initlized")


    # =============================================================================
    # wheel interface
    def on_move(self, *args):
        """
        move logic here, determine which direction and what speed to move in by params speed and angle
        """
        speed = args[0]["movSpeed"]
        angle = args[0]["movAngle"]
        print(speed, angle)

    def button_forward(self, *args):
        """
            if robot is going forward now, accelerate; decceleration otherwise;
        """
        print(args[0])


    def button_backward(self, *args):
        """
            if robot is going backward now, accelerate; decceleration otherwise;
        """
        print(args[0])

    def button_start_turn_left(self, *args):
        """
        start turn left
        """
        print(args[0])

    def button_stop_turn_left(self, *args):
        """
        stop turn left
        """
        print(args[0])

    def button_start_turn_right(self, *args):
        """
        start turn right
        """
        print(args[0])


    def button_stop_turn_right(self, *args):
        """
        start turn left
        """
        print(args[0])


    def button_stop(self, *args):
        """
        speed decceleration to zero
        """
        speed = args[0]["movSpeed"]
        angle = args[0]["movAngle"]
        print(speed, angle)

    # =============================================================================
    # arm interface

    def arm_built_in(self, *args):
        self.armBuiltInAction[args[0]]()
        

    def button_gst_init(self):
        """
            init gesture
        """
        print("init")

    def button_gst_swing(self):
        """
            swing gesture
        """
        print("swing")

    def button_gst_wave(self):
        """
            wave gesture
        """
        print("wave")

    def button_gst_stop(self):
        """
            stop current gesture
        """
        print("gesture stop")

    def arm_control(self, *args):
    	self.arm_controlXY[args[0]]() 

    def arm_controlZ(self, *args):
    	print('armZ pos: ' + args[0])

    def button_arm_forward(self):
    	print('arm forward')

    def button_arm_backward(self):
    	print('arm backward')

    def button_arm_turn_left(self):
    	print('arm turn left')

    def button_arm_turn_right(self):
    	print('arm turn right')

    def button_arm_updown(self, *args):
    	print(args[0])

    def button_arm_stop(self):
    	print('arm stop')

    # =============================================================================
    #  auto navigation interface
    
	# def move_target(self, *args):
	# 	print('remote cmd:' + args[0])
	# 	
	# 	
    def move_target(self, *args):
		print(args[0]["x"], args[0]["y"])

    def execute_cmd(self, *args):
    	print('command: '+ args[0])


	# =============================================================================
	#  command line interface
	
   

    # =============================================================================
    # camera interface & cam(ffmpeg streaming) funcationality
    def cam_control(self, *args):
    	self.camControl[args[0]]()

    def camON(self):
    	print('Camera ON')
        self.cam_stream_proc = subprocess.Popen(['ffmpeg', '-s', '320x240', '-f', 'video4linux2', '-i', '/dev/video0', '-f', 'mpeg1video', '-b:v', '800k', '-r', '30', 'http://139.129.130.13:' + self.cam_stream_port + '/123/320/240/'])

    def camOFF(self):
        if(self.cam_stream_proc):
            self.cam_stream_proc.terminate()
    	print('Camera OFF')

	# ==========================================================================
	# send robot information back	
	def update_status(self):
		"""
			send back status information,
			you can test in json format
		"""
		pass
		# return data_json
        # socket send
    def on_server_reply(self, *args):
        if args[0]:
            self.cam_stream_port = str(args[0])

    def gen_number(self): #89757 
        chars = "0123456789"; # "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
        randstr_len = len(chars) - 2
        str_length = 5
        rand_str = ''
        for i in range(str_length):
            rnum = random.randint(0,randstr_len)
            rand_str += chars[rnum:rnum+1]
        return rand_str


robotc = RobotControl()



class Namespace(LoggingNamespace):
    def on_connect(self):
        print('[Connected]')


server = '139.129.130.13'
# server = '192.168.1.128'  # change to your local server addr
port = 3000

socketIO = SocketIO(server, port, Namespace) #LoggingNamespace
socketIO.emit('botonline', {'id': robotc.gen_number(), 'msg':'bot is online'});
socketIO.on('armXY', robotc.arm_control)
socketIO.on('armZ', robotc.arm_controlZ)
socketIO.on('armBI', robotc.arm_built_in)
socketIO.on('cam', robotc.cam_control)
socketIO.on('move', robotc.on_move)
socketIO.on('stop', robotc.button_stop)
socketIO.on('movtarget', robotc.move_target)
socketIO.on('botcmd', robotc.execute_cmd)
socketIO.on('streamport', robotc.on_server_reply)
socketIO.wait()
