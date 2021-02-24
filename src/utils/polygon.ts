function onSegment(p: number[], q: number[], r: number[]) {
    return (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) && q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]))
}

// get orientation of points p, q and r
// 0: p,q,r colinear
// 1: clockwise
// 2: counterclockwise
function getOrientation(p: number[], q: number[], r: number[]) {
    var val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]); 
    if (val == 0) return 0;
    else if (val > 0) return 1;
    else return 2;
}

function intersect(p1: number[], q1: number[], p2: number[], q2: number[]) {
    var o1 = getOrientation(p1, q1, p2)
    var o2 = getOrientation(p1, q1, q2)
    var o3 = getOrientation(p2, q2, p1)
    var o4 = getOrientation(p2, q2, q1)
    if (o1 != o2 && o3 != o4) return true
    if (o1 == 0 && onSegment(p1, p2, q1)) return true
    if (o2 == 0 && onSegment(p1, q2, q1)) return true
    if (o3 == 0 && onSegment(p2, p1, q2)) return true
    if (o4 == 0 && onSegment(p2, q1, q2)) return true
    return false
}

export function isInside(polygonPoints: number[], selectedPoint: number[]) {
    if (polygonPoints.length < 6) {
        return false
    } else {
        var extreme = [1e10, selectedPoint[1]]
        var count = 0, i = 0
        do
        { 
            var next = (i+2) % polygonPoints.length 
    
            var polygonPoint = [polygonPoints[i], polygonPoints[i+1]]
            var nextPolygonPoint = [polygonPoints[next], polygonPoints[next+1]]
            if (intersect(polygonPoint, nextPolygonPoint, selectedPoint, extreme)) {
                if (getOrientation(polygonPoint, selectedPoint, nextPolygonPoint) == 0) {
                    return onSegment(polygonPoint, selectedPoint, nextPolygonPoint)
                }
                count++
            }
            i = next
        } while (i != 0)
    
        // Return true if count is odd, false otherwise
        return (count % 2 == 1)
    }
}