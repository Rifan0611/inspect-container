import 'package:flutter/material.dart';

import 'screens/LoginScreen.dart';

void main() {

  runApp(MyApp());
}

class MyApp extends StatelessWidget {

  @override
  Widget build(BuildContext context) {

    return MaterialApp(

      debugShowCheckedModeBanner: false,

      title: 'INSPECT-CONTAINER',

      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),

      home: LoginScreen(),
    );
  }
}