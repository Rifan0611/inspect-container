import 'package:flutter/material.dart';

import 'DashboardScreen.dart';

class LoginScreen extends StatefulWidget {

  @override
  State<LoginScreen> createState() =>
      _LoginScreenState();
}

class _LoginScreenState
    extends State<LoginScreen> {

  TextEditingController email =
      TextEditingController();

  TextEditingController password =
      TextEditingController();

  void login() {

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            DashboardScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      backgroundColor: Colors.blue.shade900,

      body: Center(

        child: Padding(

          padding: EdgeInsets.all(30),

          child: Column(

            mainAxisAlignment:
                MainAxisAlignment.center,

            children: [

              Text(
                'INSPECT-CONTAINER',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                ),
              ),

              SizedBox(height: 40),

              TextField(
                controller: email,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  hintText: 'Email',
                  border: OutlineInputBorder(
                    borderRadius:
                        BorderRadius.circular(20),
                  ),
                ),
              ),

              SizedBox(height: 20),

              TextField(
                controller: password,
                obscureText: true,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  hintText: 'Password',
                  border: OutlineInputBorder(
                    borderRadius:
                        BorderRadius.circular(20),
                  ),
                ),
              ),

              SizedBox(height: 30),

              SizedBox(

                width: double.infinity,

                child: ElevatedButton(

                  onPressed: login,

                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        Colors.orange,
                    padding:
                        EdgeInsets.all(18),
                    shape:
                        RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(
                              20),
                    ),
                  ),

                  child: Text(
                    'LOGIN',
                    style: TextStyle(
                      fontSize: 18,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}