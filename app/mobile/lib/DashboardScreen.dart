import 'package:flutter/material.dart';

import 'InspectionScreen.dart';

class DashboardScreen extends StatelessWidget {

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      backgroundColor: Colors.black,

      appBar: AppBar(
        title: Text('Dashboard'),
        backgroundColor: Colors.blue.shade900,
      ),

      body: Padding(

        padding: EdgeInsets.all(20),

        child: Column(

          crossAxisAlignment:
              CrossAxisAlignment.start,

          children: [

            Text(
              'SMART CONTAINER SYSTEM',
              style: TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),

            SizedBox(height: 30),

            Row(

              children: [

                dashboardCard(
                  'Inspection',
                  '120',
                ),

                SizedBox(width: 20),

                dashboardCard(
                  'Damage',
                  '45',
                ),

              ],
            ),

            SizedBox(height: 30),

            SizedBox(

              width: double.infinity,

              child: ElevatedButton(

                onPressed: () {

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          InspectionScreen(),
                    ),
                  );
                },

                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      Colors.orange,
                  padding:
                      EdgeInsets.all(18),
                ),

                child: Text(
                  'NEW INSPECTION',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget dashboardCard(
      String title,
      String value) {

    return Expanded(

      child: Container(

        padding: EdgeInsets.all(20),

        decoration: BoxDecoration(

          color: Colors.blue.shade900,

          borderRadius:
              BorderRadius.circular(25),
        ),

        child: Column(

          children: [

            Text(
              title,
              style: TextStyle(
                color: Colors.white70,
              ),
            ),

            SizedBox(height: 10),

            Text(
              value,
              style: TextStyle(
                color: Colors.white,
                fontSize: 35,
                fontWeight:
                    FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}